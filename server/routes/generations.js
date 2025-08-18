const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user's generations
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, type, category } = req.query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = { userId };
    if (type) where.type = type;
    if (category) where.category = category;

    const [generations, total] = await Promise.all([
      prisma.generation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          favorites: {
            where: { userId }
          }
        }
      }),
      prisma.generation.count({ where })
    ]);

    // Transform to include isFavorite flag
    const transformedGenerations = generations.map(gen => ({
      ...gen,
      isFavorite: gen.favorites.length > 0,
      favorites: undefined // Remove the favorites array from response
    }));

    res.json({
      generations: transformedGenerations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching generations:', error);
    res.status(500).json({ error: 'Failed to fetch generations' });
  }
});

// Get a specific generation
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const generation = await prisma.generation.findFirst({
      where: {
        id,
        userId
      },
      include: {
        favorites: {
          where: { userId }
        }
      }
    });

    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    res.json({
      ...generation,
      isFavorite: generation.favorites.length > 0,
      favorites: undefined
    });

  } catch (error) {
    console.error('Error fetching generation:', error);
    res.status(500).json({ error: 'Failed to fetch generation' });
  }
});

// Toggle favorite status
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Check if generation exists and belongs to user
    const generation = await prisma.generation.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_generationId: {
          userId,
          generationId: id
        }
      }
    });

    if (existingFavorite) {
      // Remove from favorites
      await prisma.favorite.delete({
        where: {
          userId_generationId: {
            userId,
            generationId: id
          }
        }
      });
      res.json({ isFavorite: false });
    } else {
      // Add to favorites
      await prisma.favorite.create({
        data: {
          userId,
          generationId: id
        }
      });
      res.json({ isFavorite: true });
    }

  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

// Get user's favorites
router.get('/favorites/list', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        include: {
          generation: true
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.favorite.count({ where: { userId } })
    ]);

    // Transform to match generation format
    const generations = favorites.map(fav => ({
      ...fav.generation,
      isFavorite: true
    }));

    res.json({
      generations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Delete a generation
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const generation = await prisma.generation.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    await prisma.generation.delete({
      where: { id }
    });

    res.json({ message: 'Generation deleted successfully' });

  } catch (error) {
    console.error('Error deleting generation:', error);
    res.status(500).json({ error: 'Failed to delete generation' });
  }
});

module.exports = router;
