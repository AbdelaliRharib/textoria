const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndFixUserRole() {
  try {
    console.log('🔍 Vérification des rôles utilisateurs...');
    
    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    
    console.log(`📊 Nombre total d'utilisateurs: ${users.length}`);
    
    // Afficher tous les utilisateurs avec leurs rôles
    users.forEach(user => {
      console.log(`👤 ${user.email} - Rôle: ${user.role} - Actif: ${user.isActive}`);
    });
    
    // Compter les rôles
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📈 Distribution des rôles:');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`  ${role}: ${count} utilisateur(s)`);
    });
    
    // Demander si l'utilisateur veut changer un rôle
    console.log('\n🔧 Pour changer le rôle d\'un utilisateur, utilisez:');
    console.log('node change-user-role.js <email> <nouveau_role>');
    console.log('Rôles disponibles: USER, MODERATOR, ADMIN');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
checkAndFixUserRole();

