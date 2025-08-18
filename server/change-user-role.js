const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function changeUserRole(email, newRole) {
  try {
    // Valider le rôle
    const validRoles = ['USER', 'MODERATOR', 'ADMIN'];
    if (!validRoles.includes(newRole.toUpperCase())) {
      console.error('❌ Rôle invalide. Rôles disponibles:', validRoles.join(', '));
      return;
    }

    console.log(`🔍 Recherche de l'utilisateur: ${email}`);
    
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });
    
    if (!user) {
      console.error('❌ Utilisateur non trouvé');
      return;
    }
    
    console.log(`👤 Utilisateur trouvé: ${user.firstName} ${user.lastName}`);
    console.log(`📊 Rôle actuel: ${user.role}`);
    console.log(`🔄 Changement vers: ${newRole.toUpperCase()}`);
    
    // Demander confirmation
    console.log('\n⚠️  Êtes-vous sûr de vouloir changer le rôle? (y/N)');
    
    // Pour automatiser, on peut commenter cette partie
    // const readline = require('readline');
    // const rl = readline.createInterface({
    //   input: process.stdin,
    //   output: process.stdout
    // });
    // 
    // rl.question('', async (answer) => {
    //   rl.close();
    //   if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    //     console.log('❌ Opération annulée');
    //     return;
    //   }
    //   await updateRole();
    // });
    
    // Pour l'instant, on fait le changement directement
    await updateRole();
    
    async function updateRole() {
      try {
        // Mettre à jour le rôle
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { role: newRole.toUpperCase() },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true
          }
        });
        
        console.log('✅ Rôle mis à jour avec succès!');
        console.log(`👤 ${updatedUser.firstName} ${updatedUser.lastName} (${updatedUser.email})`);
        console.log(`📊 Nouveau rôle: ${updatedUser.role}`);
        
        // Afficher les conséquences
        if (newRole.toUpperCase() === 'ADMIN') {
          console.log('\n⚠️  ATTENTION: Cet utilisateur aura accès au panneau d\'administration');
          console.log('   Il sera redirigé vers /admin au lieu de /dashboard');
        } else {
          console.log('\n✅ Cet utilisateur aura accès au dashboard normal');
          console.log('   Il sera redirigé vers /dashboard');
        }
        
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer les arguments de ligne de commande
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('📖 Usage: node change-user-role.js <email> <nouveau_role>');
  console.log('📖 Exemple: node change-user-role.js john@example.com USER');
  console.log('📖 Rôles disponibles: USER, MODERATOR, ADMIN');
  process.exit(1);
}

const [email, newRole] = args;

// Exécuter le script
changeUserRole(email, newRole);

