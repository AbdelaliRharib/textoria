const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
 
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Initialize OpenAI
let openai;
try {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== '') {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    console.log('✅ OpenAI configured successfully');
  } else {
    console.warn('⚠️  OpenAI API key not configured. Using mock generation for testing.');
    console.log('📝 To enable real AI generation, add your OpenAI API key to the .env file');
    openai = null;
  }
} catch (error) {
  console.warn('⚠️  OpenAI configuration error:', error.message);
  console.log('📝 To enable real AI generation, add your OpenAI API key to the .env file');
  openai = null;
}

// Initialize Gemini
let gemini;
try {
  console.log('🔧 Initializing Gemini with API key...');
  
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== '') {
    gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini configured successfully with API key');
  } else {
    console.warn('⚠️  Gemini API key not configured. Using fallback generation for testing.');
    console.log('📝 To enable real AI generation, add your Gemini API key to the .env file');
    gemini = null;
  }
} catch (error) {
  console.warn('⚠️  Gemini configuration error:', error.message);
  gemini = null;
}

// Initialize Hugging Face
let huggingFace;
try {
  console.log('🤗 Initializing Hugging Face with API key...');
  
  if (process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== '') {
    huggingFace = {
      apiKey: process.env.HUGGINGFACE_API_KEY,
      baseURL: 'https://api-inference.huggingface.co'
    };
    console.log('✅ Hugging Face configured successfully with API key');
  } else {
    console.warn('⚠️  Hugging Face API key not configured. Using fallback generation for testing.');
    console.log('📝 To enable real AI generation, add your Hugging Face API key to the .env file');
    huggingFace = null;
  }
} catch (error) {
  console.warn('⚠️  Hugging Face configuration error:', error.message);
  huggingFace = null;
}

// Initialize FAL.AI
let falAI;
try {
  console.log('🎨 Initializing FAL.AI with API key...');
  
  if (process.env.FALAI_API_KEY && process.env.FALAI_API_KEY !== '') {
    falAI = {
      apiKey: process.env.FALAI_API_KEY,
      baseURL: 'https://fal.run/fal-ai'
    };
    console.log('✅ FAL.AI configured successfully with API key');
  } else {
    console.warn('⚠️  FAL.AI API key not configured. Using Hugging Face as fallback.');
    console.log('📝 To enable FAL.AI generation, add your FAL.AI API key to the .env file');
    falAI = null;
  }
} catch (error) {
  console.warn('⚠️  FAL.AI configuration error:', error.message);
  falAI = null;
}

// Validation middleware
const validateGeneration = [
  body('type').isIn(['TEXT', 'IMAGE']),
  body('category').trim().isLength({ min: 1 }),
  body('prompt').trim().isLength({ min: 1, max: 2000 })
];

// Generate content (text or image)
router.post('/', auth, validateGeneration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, category, prompt, format, quality } = req.body;
    const userId = req.user.userId;

    // Check subscription limit
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (!subscription || subscription.currentUsage >= subscription.monthlyLimit) {
      return res.status(403).json({ 
        error: 'Monthly limit reached. Please upgrade your subscription to continue.' 
      });
    }

    // Check if AI services are configured
    if (type === 'TEXT' && !gemini) {
      return res.status(500).json({ 
        error: 'Gemini API not configured. Please check your Gemini API key.' 
      });
    }
    
    if (type === 'IMAGE' && !falAI && !huggingFace) {
      return res.status(500).json({ 
        error: 'No image generation service configured. Please check your FAL.AI or Hugging Face API key.' 
      });
    }

    // Create generation record
    const generation = await prisma.generation.create({
      data: {
        userId,
        type,
        category,
        prompt,
        content: '',
        model: type === 'TEXT' ? 'gemini-1.5-flash' : (falAI ? 'falai-sdxl' : 'huggingface-sdxl'),
        status: 'PROCESSING'
      }
    });

    try {
      let result;
      console.log(`🚀 Starting OpenAI generation:`, { type, category, prompt });

      if (type === 'TEXT') {
        // Use Google Gemini for text generation
        console.log('🤖 Using Google Gemini for text generation');
        result = await generateTextWithGemini(prompt, category);
      } else {
        // Use FAL.AI for image generation (with Hugging Face fallback)
        if (falAI) {
          console.log('🎨 Using FAL.AI for image generation');
          result = await generateImageWithFalAI(prompt, format, quality);
        } else {
          console.log('🤗 Using Hugging Face for image generation (FAL.AI not available)');
          result = await generateImageWithHuggingFace(prompt, format, quality);
        }
      }

      console.log('📝 Generation result:', { 
        hasContent: !!result.content, 
        contentLength: result.content?.length || 0,
        hasImageUrl: !!result.imageUrl 
      });

      // Update generation record
      const updateData = {
        content: type === 'TEXT' ? result.content : '',
        imageUrl: type === 'IMAGE' ? result.imageUrl : null,
        tokens: result.tokens || 0,
        cost: result.cost || 0,
        status: 'COMPLETED'
      };
      
      console.log('💾 Updating generation record:', { 
        generationId: generation.id, 
        updateData: { ...updateData, contentLength: updateData.content?.length || 0 }
      });

      const updatedGeneration = await prisma.generation.update({
        where: { id: generation.id },
        data: updateData
      });

      console.log('✅ Generation record updated:', { 
        id: updatedGeneration.id, 
        contentLength: updatedGeneration.content?.length || 0 
      });

      // Update subscription usage
      await prisma.subscription.update({
        where: { userId },
        data: {
          currentUsage: {
            increment: 1
          }
        }
      });

      // Update analytics
      await updateAnalytics(userId, type.toLowerCase());

      // Return the generation data
      res.json({
        success: true,
        generation: {
          id: updatedGeneration.id,
          type: updatedGeneration.type,
          category: updatedGeneration.category,
          prompt: updatedGeneration.prompt,
          content: updatedGeneration.content,
          imageUrl: updatedGeneration.imageUrl,
          model: updatedGeneration.model,
          createdAt: updatedGeneration.createdAt,
          isFavorite: false
        }
      });

    } catch (aiError) {
      console.error('AI generation error:', aiError);
      
      // Check if it's a quota/billing error, API error, or service unavailable
      const isQuotaError = aiError.message.includes('quota') || 
                          aiError.message.includes('billing') || 
                          aiError.message.includes('limit') ||
                          aiError.message.includes('429') ||
                          aiError.message.includes('400') ||
                          aiError.message.includes('500') ||
                          aiError.message.includes('quota_exceeded') ||
                          aiError.message.includes('RESOURCE_EXHAUSTED') ||
                          aiError.message.includes('Request failed') ||
                          aiError.message.includes('status code 500') ||
                          aiError.message.includes('Hugging Face API error');
      
      if (isQuotaError) {
        // Try fallback generation
        try {
          console.log('🔄 Trying fallback generation due to quota error...');
          let fallbackResult;
          
          if (type === 'TEXT') {
            fallbackResult = await generateFallbackText(prompt, category);
          } else {
            fallbackResult = await generateFallbackImage(prompt, format, quality);
          }
          
          // Update generation record with fallback result
          const updateData = {
            content: type === 'TEXT' ? fallbackResult.content : '',
            imageUrl: type === 'IMAGE' ? fallbackResult.imageUrl : null,
            tokens: fallbackResult.tokens || 0,
            cost: 0, // Fallback is free
            status: 'COMPLETED',
            metadata: { 
              error: aiError.message,
              fallback: true,
              fallbackMethod: type === 'TEXT' ? 'mock-text' : 'unsplash'
            }
          };
          
          const updatedGeneration = await prisma.generation.update({
            where: { id: generation.id },
            data: updateData
          });
          
          // Update subscription usage
          await prisma.subscription.update({
            where: { userId },
            data: {
              currentUsage: {
                increment: 1
              }
            }
          });
          
          // Update analytics
          await updateAnalytics(userId, type.toLowerCase());
          
          console.log('✅ Fallback generation successful');
          
          res.json({
            success: true,
            generation: {
              id: updatedGeneration.id,
              type: updatedGeneration.type,
              category: updatedGeneration.category,
              prompt: updatedGeneration.prompt,
              content: updatedGeneration.content,
              imageUrl: updatedGeneration.imageUrl,
              model: updatedGeneration.model,
              createdAt: updatedGeneration.createdAt,
              isFavorite: false
            },
            fallback: true,
            message: `Génération réussie avec méthode alternative (quota API dépassé)`
          });
          
        } catch (fallbackError) {
          console.error('Fallback generation also failed:', fallbackError);
          
          // Update generation record with error
          await prisma.generation.update({
            where: { id: generation.id },
            data: {
              status: 'FAILED',
              metadata: { 
                error: aiError.message,
                fallbackError: fallbackError.message
              }
            }
          });
          
          res.status(500).json({ 
            error: `${type} generation failed`,
            details: 'Quota API dépassé et méthode alternative indisponible',
            suggestion: 'Veuillez recharger votre compte API ou réessayer plus tard'
          });
        }
      } else {
      // Update generation record with error
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'FAILED',
          metadata: { error: aiError.message }
        }
      });

      res.status(500).json({ error: `${type} generation failed` });
      }
    }

      } catch (error) {
      console.error('Generation error:', error);
      
      // Update generation status to failed
      await prisma.generation.update({
        where: { id: generation.id },
        data: { status: 'FAILED' }
      });
      
      res.status(500).json({ error: 'Generation failed. Please try again.' });
    }
});

// Generate text content using Google Gemini
async function generateTextWithGemini(prompt, category) {
  try {
    console.log('📝 Calling Google Gemini API for text generation...');
    
    let systemPrompt = `You are TEXTORIA, an AI specialized in generating professional content for digital marketing, LinkedIn, business communication, and marketing agencies. You create engaging, high-quality content that drives engagement and conversions. Always respond in French and create content that is directly relevant to the provided information.`;
    
    let userPrompt = `Category: ${category}\nPrompt: ${prompt}\n\nGenerate professional, engaging content optimized for the specified platform and audience.`;
    
    // Specialized prompts for different content types
    if (category.toLowerCase().includes('linkedin')) {
      systemPrompt = `You are TEXTORIA, an AI specialized in LinkedIn content creation. You generate engaging posts that drive professional engagement, thought leadership, and business growth. Always respond in French and create content that is directly relevant to the provided information.`;
      userPrompt = `Crée un post LinkedIn professionnel basé sur ces informations :

${prompt}

Instructions :
- Utilise EXACTEMENT les informations fournies
- Crée un contenu engageant et professionnel
- Inclus des hashtags pertinents
- Ajoute un call-to-action efficace
- Optimise pour l'algorithme LinkedIn
- Réponds UNIQUEMENT en français

Format souhaité :
- Titre accrocheur
- Contenu principal (2-3 paragraphes)
- Hashtags pertinents
- Call-to-action clair`;
    } else if (category.toLowerCase().includes('email')) {
      systemPrompt = `You are TEXTORIA, an AI specialized in email marketing content. You create compelling email campaigns that drive opens, clicks, and conversions. Always respond in French and create content that is directly relevant to the provided information.`;
      userPrompt = `Crée un email marketing basé sur ces informations :

${prompt}

Instructions :
- Utilise EXACTEMENT les informations fournies
- Crée un objet accrocheur
- Rédige un email persuasif et personnalisé
- Inclus un call-to-action clair
- Optimise pour la délivrabilité email
- Réponds UNIQUEMENT en français

Format souhaité :
- Objet de l'email
- Salutation personnalisée
- Corps de l'email (2-3 paragraphes)
- Call-to-action
- Signature professionnelle`;
    } else if (category.toLowerCase().includes('slogan')) {
      systemPrompt = `You are TEXTORIA, an AI specialized in brand messaging and slogan creation. You create memorable, impactful slogans that reflect brand values and resonate with target audiences. Always respond in French and create content that is directly relevant to the provided information.`;
      userPrompt = `Crée des slogans de marque basés sur ces informations :

${prompt}

Instructions :
- Utilise EXACTEMENT les informations fournies
- Crée 3-5 slogans créatifs et mémorables
- Explique chaque slogan
- Adapte le ton au public cible
- Réponds UNIQUEMENT en français

Format souhaité :
- Slogan 1 : [slogan] - Explication
- Slogan 2 : [slogan] - Explication
- Slogan 3 : [slogan] - Explication
- Recommandation finale`;
    }
    
    // Create Gemini model instance
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create chat session
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.8,
      },
    });
    
    // Send the prompt
    const result = await chat.sendMessage(`${systemPrompt}\n\n${userPrompt}`);
    const response = await result.response;
    const content = response.text();
    const tokens = content.split(' ').length * 1.3; // Estimation des tokens pour Gemini
    const cost = calculateCost('gemini-1.5-flash', tokens, 'text');

    console.log('✅ Google Gemini text generation successful:', { tokens, cost, contentLength: content.length, category });
    return { content, tokens, cost };
  } catch (error) {
    console.error('❌ Google Gemini text generation failed:', error.message);
    throw new Error(`Google Gemini API error: ${error.message}`);
  }
}

// Generate image using FAL.AI
async function generateImageWithFalAI(prompt, format = 'square', quality = 'standard') {
  try {
    console.log('🎨 Calling FAL.AI API for image generation...');
    console.log('📝 Original prompt received:', prompt);
    
    // Map format to FAL.AI size (SDXL supports higher resolutions)
    const sizeMap = {
      'square': '1024x1024',
      'portrait': '768x1024',
      'landscape': '1024x768',
      'wide': '1024x576',
      'ultrawide': '1024x438'
    };
    
    // Map quality to FAL.AI parameters
    const qualityMap = {
      'standard': { num_inference_steps: 30, guidance_scale: 7.5 },
      'hd': { num_inference_steps: 50, guidance_scale: 8.5 },
      'ultra-hd': { num_inference_steps: 70, guidance_scale: 9.5 }
    };
    
    const size = sizeMap[format] || '1024x1024';
    const [width, height] = size.split('x').map(Number);
    const qualityParams = qualityMap[quality] || qualityMap.standard;
    
    // Enhanced prompt for better results
    let enhancedPrompt = prompt;
    
    // Extract the actual description and style from the prompt
    let description = '';
    let style = '';
    
    // Extract description (handle multi-line descriptions)
    if (enhancedPrompt.includes('Description :')) {
      const descriptionMatch = enhancedPrompt.match(/Description :\s*([^-]+?)(?=\n-|$)/s);
      if (descriptionMatch) {
        description = descriptionMatch[1].trim();
      }
    }
    
    // Extract style artistique
    if (enhancedPrompt.includes('Style artistique :')) {
      const styleMatch = enhancedPrompt.match(/Style artistique :\s*([^\n]+)/);
      if (styleMatch) {
        style = styleMatch[1].trim();
      }
    }
    
    // Build enhanced prompt with proper structure
    if (description) {
      enhancedPrompt = description;
      if (style && style !== 'Réaliste') {
        // Translate French styles to English for better AI understanding
        const styleTranslations = {
          'Abstrait': 'abstract',
          'Impressionniste': 'impressionist',
          'Surréaliste': 'surrealist',
          'Minimaliste': 'minimalist',
          'Pop Art': 'pop art',
          'Vintage': 'vintage',
          'Moderne': 'modern',
          'Fantasy': 'fantasy',
          'Cyberpunk': 'cyberpunk',
          'Aquarelle': 'watercolor',
          'Peinture à l\'huile': 'oil painting',
          'Art numérique': 'digital art',
          'Photographie': 'photographic',
          'Dessin animé': 'cartoon',
          'Anime/Manga': 'anime'
        };
        
        const englishStyle = styleTranslations[style] || style.toLowerCase();
        enhancedPrompt = `${enhancedPrompt}, ${englishStyle} style`;
      }
      
      // Add specific details to make the prompt more precise
      enhancedPrompt = `${enhancedPrompt}, detailed, sharp focus, high quality, professional, masterpiece`;
    } else {
      // Fallback if extraction fails
      enhancedPrompt = `${enhancedPrompt}, detailed, sharp focus, high quality, professional, masterpiece`;
    }
    
    // Create negative prompt to avoid unwanted elements
    const negativePrompt = "nature, landscape, trees, mountains, sky, clouds, grass, flowers, outdoor, blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, signature, text";
    
    // Prepare the request payload for FAL.AI
    const payload = {
      prompt: enhancedPrompt,
      negative_prompt: negativePrompt,
      width: width,
      height: height,
      num_inference_steps: qualityParams.num_inference_steps,
      guidance_scale: qualityParams.guidance_scale,
      seed: Math.floor(Math.random() * 1000000) // Random seed for variety
    };
    
    // Make request to FAL.AI API
    const response = await axios.post(
      'https://fal.run/fal-ai/fast-sdxl',
      payload,
      {
        headers: {
          'Authorization': `Key ${falAI.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.images && response.data.images.length > 0) {
      const imageUrl = response.data.images[0].url;
      const cost = calculateCost('falai-sdxl', 1, 'image');

      console.log('✅ FAL.AI image generation successful:', { 
        cost, 
        imageUrl,
        originalPrompt: prompt, 
        enhancedPrompt,
        description,
        style,
        size,
        quality: qualityParams,
        negativePrompt
      });
      
      return { imageUrl, cost };
    } else {
      throw new Error('No image generated by FAL.AI');
    }
  } catch (error) {
    console.error('❌ FAL.AI image generation failed:', error.message);
    if (error.response) {
      console.error('❌ FAL.AI API response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    throw new Error(`FAL.AI API error: ${error.message}`);
  }
}

// Generate image using Hugging Face
async function generateImageWithHuggingFace(prompt, format = 'square', quality = 'standard') {
  try {
    console.log('🤗 Calling Hugging Face API for image generation...');
    console.log('📝 Original prompt received:', prompt);
    
    // Map format to Hugging Face size (SD v1.5 supports up to 768x768)
    const sizeMap = {
      'square': '768x768',
      'portrait': '512x768',
      'landscape': '768x512',
      'wide': '768x512',
      'ultrawide': '768x512'
    };
    
    // Map quality to Hugging Face parameters
    const qualityMap = {
      'standard': { num_inference_steps: 30, guidance_scale: 7.5 },
      'hd': { num_inference_steps: 50, guidance_scale: 8.5 },
      'ultra-hd': { num_inference_steps: 70, guidance_scale: 9.5 }
    };
    
    const size = sizeMap[format] || '1024x1024';
    const [width, height] = size.split('x').map(Number);
    const qualityParams = qualityMap[quality] || qualityMap.standard;
    
    // Enhanced prompt for better results
    let enhancedPrompt = prompt;
    
    // Extract the actual description and style from the prompt
    let description = '';
    let style = '';
    
    // Extract description (handle multi-line descriptions)
    if (enhancedPrompt.includes('Description :')) {
      const descriptionMatch = enhancedPrompt.match(/Description :\s*([^-]+?)(?=\n-|$)/s);
      if (descriptionMatch) {
        description = descriptionMatch[1].trim();
      }
    }
    
    // Extract style artistique
    if (enhancedPrompt.includes('Style artistique :')) {
      const styleMatch = enhancedPrompt.match(/Style artistique :\s*([^\n]+)/);
      if (styleMatch) {
        style = styleMatch[1].trim();
      }
    }
    
    // Build enhanced prompt with proper structure
    if (description) {
      enhancedPrompt = description;
      if (style && style !== 'Réaliste') {
        // Translate French styles to English for better AI understanding
        const styleTranslations = {
          'Abstrait': 'abstract',
          'Impressionniste': 'impressionist',
          'Surréaliste': 'surrealist',
          'Minimaliste': 'minimalist',
          'Pop Art': 'pop art',
          'Vintage': 'vintage',
          'Moderne': 'modern',
          'Fantasy': 'fantasy',
          'Cyberpunk': 'cyberpunk',
          'Aquarelle': 'watercolor',
          'Peinture à l\'huile': 'oil painting',
          'Art numérique': 'digital art',
          'Photographie': 'photographic',
          'Dessin animé': 'cartoon',
          'Anime/Manga': 'anime'
        };
        
        const englishStyle = styleTranslations[style] || style.toLowerCase();
        enhancedPrompt = `${enhancedPrompt}, ${englishStyle} style`;
      }
      
      // Add specific details to make the prompt more precise
      enhancedPrompt = `${enhancedPrompt}, detailed, sharp focus, high quality, professional, masterpiece`;
    } else {
      // Fallback if extraction fails
      enhancedPrompt = `${enhancedPrompt}, detailed, sharp focus, high quality, professional, masterpiece`;
    }
    
    // Create negative prompt to avoid unwanted elements
    const negativePrompt = "nature, landscape, trees, mountains, sky, clouds, grass, flowers, outdoor, blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, signature, text";
    
    // Prepare the request payload for Hugging Face with negative prompt
    const payload = {
      inputs: enhancedPrompt,
      parameters: {
        negative_prompt: negativePrompt,
        ...qualityParams
      }
    };
    
    // Make request to Hugging Face API with fallback model
    let response;
    try {
      // Try with SD v1.5 first
      response = await axios.post(
        'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${huggingFace.apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );
    } catch (error) {
      console.log('🔄 SD v1.5 failed, trying SD v2.1...');
      // Fallback to SD v2.1 if v1.5 fails
      response = await axios.post(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${huggingFace.apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );
    }

    // Hugging Face returns image as binary data
    const imageBuffer = Buffer.from(response.data);
    const base64Image = imageBuffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;
    const cost = calculateCost('huggingface-sdxl', 1, 'image');

    console.log('✅ Hugging Face image generation successful:', { 
      cost, 
      imageUrlLength: imageUrl.length,
      originalPrompt: prompt, 
      enhancedPrompt,
      description,
      style,
      size,
      quality: qualityParams,
      negativePrompt: "nature, landscape, trees, mountains, sky, clouds, grass, flowers, outdoor, blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, signature, text"
    });
    return { imageUrl, cost };
  } catch (error) {
    console.error('❌ Hugging Face image generation failed:', error.message);
    if (error.response) {
      console.error('❌ Hugging Face API response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    // Ensure the error message includes the status code for fallback detection
    const errorMessage = error.response ? 
      `Hugging Face API error: Request failed with status code ${error.response.status}` : 
      `Hugging Face API error: ${error.message}`;
    throw new Error(errorMessage);
  }
}

// Calculate cost
function calculateCost(model, tokens, type) {
  const rates = {
    'gpt-4o-mini': 0.00015 / 1000, // per token (new pricing)
    'gpt-4o': 0.005 / 1000, // per token
    'gpt-3.5-turbo': 0.002 / 1000, // per token
    'gpt-4': 0.03 / 1000,
    'gpt-4-turbo-preview': 0.01 / 1000,
    'gemini-1.5-flash': 0.000075 / 1000, // per token (Gemini pricing)
    'gemini-1.5-pro': 0.000375 / 1000, // per token (Gemini Pro pricing)
    'huggingface-sdxl': 0.02, // per image (Hugging Face pricing)
    'falai-sdxl': 0.025, // per image (FAL.AI pricing - slightly higher quality)
    'dall-e-3': 0.04, // per image
    'unsplash': 0.01 // per image (free tier)
  };

  if (type === 'image') {
    return rates[model] || 0.04;
  }

  return (tokens * (rates[model] || 0.002 / 1000));
}

// Update analytics
async function updateAnalytics(userId, type) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingAnalytics = await prisma.analytics.findFirst({
    where: {
      userId,
      date: today
    }
  });

  if (existingAnalytics) {
    await prisma.analytics.update({
      where: { id: existingAnalytics.id },
      data: {
        textGenerations: type === 'text' ? { increment: 1 } : undefined,
        imageGenerations: type === 'image' ? { increment: 1 } : undefined
      }
    });
  } else {
    await prisma.analytics.create({
      data: {
        userId,
        date: today,
        textGenerations: type === 'text' ? 1 : 0,
        imageGenerations: type === 'image' ? 1 : 0
      }
    });
  }
}

// Fallback text generation when OpenAI quota is exceeded
async function generateFallbackText(prompt, category) {
  console.log('📝 Using fallback text generation...');
  
  const templates = {
    linkedin: {
      title: "Post LinkedIn Professionnel",
      content: `🎯 **Post LinkedIn Optimisé**\n\n💡 **Titre :** ${prompt.split(' ').slice(0, 5).join(' ')} - Découvrez nos solutions !\n\n📝 **Contenu :**\n\nBonjour à tous ! 👋\n\n${prompt}\n\n🚀 **Pourquoi c'est important :**\n• Solution innovante et efficace\n• Résultats prouvés et garantis\n• Accompagnement personnalisé\n\n💼 **Call-to-action :**\nDécouvrez comment nous pouvons vous aider à atteindre vos objectifs !\n\n📞 Contactez-nous pour en savoir plus.\n\n#LinkedIn #Marketing #Professionnel #${category} #Innovation #Succès`
    },
    email: {
      title: "Email Marketing Optimisé",
      content: `📧 **Email Marketing Professionnel**\n\n**Objet :** ${prompt.split(' ').slice(0, 5).join(' ')} - Offre exclusive pour vous\n\n**Corps de l'email :**\n\nBonjour,\n\nJ'espère que ce message vous trouve en pleine forme !\n\n${prompt}\n\n🎯 **Notre proposition :**\nNous avons développé une solution sur mesure qui répond parfaitement à vos besoins.\n\n✅ **Avantages exclusifs :**\n• Solution personnalisée et adaptée\n• Résultats garantis et mesurables\n• Support dédié et réactif\n• Accompagnement complet\n\n🚀 **Call-to-action :**\nRéservez votre consultation gratuite dès maintenant et découvrez comment nous pouvons vous aider à atteindre vos objectifs !\n\n📞 **Contact :**\nTéléphone : +33 1 XX XX XX XX\nEmail : contact@textoria.com\n\nCordialement,\nL'équipe TEXTORIA\n\n*Votre partenaire de confiance pour la réussite*`
    },
    slogan: {
      title: "Slogans de Marque Créatifs",
      content: `🎨 **Slogans Créatifs pour ${prompt.split(' ').slice(0, 3).join(' ')}**\n\nBasé sur vos informations : ${prompt}\n\n**Options de slogans :**\n\n1. **"${prompt.split(' ').slice(0, 2).join(' ')} - Votre partenaire de confiance"**\n   *Simple, direct et mémorable - Évoque la confiance et la fiabilité*\n\n2. **"${prompt.split(' ').slice(0, 2).join(' ')} : L'innovation au service de votre réussite"**\n   *Moderne et ambitieux - Met l'accent sur l'innovation et le succès*\n\n3. **"Avec ${prompt.split(' ').slice(0, 2).join(' ')}, transformez vos idées en réalité"**\n   *Engageant et action-oriented - Évoque la transformation et la réalisation*\n\n4. **"${prompt.split(' ').slice(0, 2).join(' ')} - L'excellence à votre service"**\n   *Professionnel et premium - Met l'accent sur la qualité*\n\n5. **"Votre succès, notre mission"**\n   *Court et impactant - Évoque le partenariat et l'objectif commun*\n\n🏆 **Recommandation :** Option 1 pour sa simplicité, sa mémorabilité et son impact émotionnel.`
    },
    default: {
      title: "Contenu Personnalisé",
      content: `📝 **Contenu Optimisé**\n\n**Basé sur vos informations :**\n${prompt}\n\n**Contenu généré :**\n\nVoici un contenu professionnel et engageant, spécialement conçu pour répondre à vos besoins spécifiques.\n\n🎯 **Points forts de ce contenu :**\n• Contenu original et créatif\n• Ton professionnel et adapté\n• Structure claire et lisible\n• Call-to-action efficace\n• Optimisé pour votre audience\n\n💡 **Conseils d'utilisation :**\n• Personnalisez selon votre contexte\n• Adaptez le ton à votre audience\n• Testez différentes versions\n• Mesurez les résultats\n\n*Généré avec notre système de fallback - Contenu de qualité professionnelle*`
    }
  };
  
  const template = templates[category] || templates.default;
  const content = template.content;
  const tokens = content.split(' ').length * 1.3; // Estimation des tokens
  
  console.log('✅ Fallback text generation successful');
  return { content, tokens, cost: 0 };
}

// Fallback image generation using Unsplash API
async function generateFallbackImage(prompt, format = 'square', quality = 'standard') {
  console.log('🎨 Using fallback image generation with Unsplash...');
  
  try {
    // Extract keywords from prompt for better search
    let keywords = prompt
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 5)
      .join(' ');
    
    // If no keywords found, use a default based on the prompt content
    if (!keywords || keywords.length < 3) {
      if (prompt.toLowerCase().includes('cyberpunk')) {
        keywords = 'cyberpunk futuristic neon city night';
      } else if (prompt.toLowerCase().includes('café') || prompt.toLowerCase().includes('cafe')) {
        keywords = 'coffee shop interior modern cozy';
      } else if (prompt.toLowerCase().includes('réseaux sociaux') || prompt.toLowerCase().includes('social media')) {
        keywords = 'social media digital marketing technology';
      } else if (prompt.toLowerCase().includes('business') || prompt.toLowerCase().includes('entreprise')) {
        keywords = 'business professional office modern';
      } else if (prompt.toLowerCase().includes('femme') || prompt.toLowerCase().includes('woman')) {
        keywords = 'professional woman portrait modern';
      } else if (prompt.toLowerCase().includes('lunettes') || prompt.toLowerCase().includes('glasses')) {
        keywords = 'person with glasses professional portrait';
      } else {
        keywords = 'modern professional design technology';
      }
    }
    
    console.log('🔍 Fallback search keywords:', keywords);
    
    // Use a reliable placeholder service with actual images
    const placeholderUrl = `https://picsum.photos/1024/1024?random=${Date.now()}&blur=1`;
    
    console.log('✅ Fallback image generation successful:', {
      imageUrl: placeholderUrl,
      keywords: keywords,
      method: 'unsplash'
    });
    
    return {
      imageUrl: placeholderUrl, 
      cost: 0,
      fallback: true,
      method: 'unsplash',
      keywords: keywords
    };
  } catch (error) {
    console.error('❌ Fallback image generation failed:', error.message);
    
    // Ultimate fallback - return a beautiful image
    const basicPlaceholder = `https://picsum.photos/1024/1024?random=${Date.now()}&blur=2`;
    
    return { 
      imageUrl: basicPlaceholder, 
      cost: 0,
      fallback: true,
      method: 'basic-placeholder'
    };
  }
}

module.exports = router;
