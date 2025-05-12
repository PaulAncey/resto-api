const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Bienvenue dans le script d\'installation et de démarrage de l\'API Restaurant !');

const checkDependencies = () => {
  return new Promise((resolve) => {
    console.log('\nVérification des dépendances...');
    
    if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
      console.log('Installation des dépendances avec npm install...');
      const install = spawn('npm', ['install'], { stdio: 'inherit' });
      
      install.on('close', (code) => {
        if (code === 0) {
          console.log('Dépendances installées avec succès !');
          resolve(true);
        } else {
          console.error('Erreur lors de l\'installation des dépendances.');
          resolve(false);
        }
      });
    } else {
      console.log('Les dépendances sont déjà installées.');
      resolve(true);
    }
  });
};

const checkEnvFile = () => {
  return new Promise((resolve) => {
    console.log('\nVérification du fichier .env...');
    
    if (!fs.existsSync(path.join(__dirname, '.env'))) {
      console.log('Fichier .env non trouvé. Création d\'un fichier .env par défaut...');
      
      console.log('Configuration de la base de données MySQL :');
      
      const askDBConfig = () => {
        rl.question('Nom d\'utilisateur MySQL (par défaut: root): ', (dbUser) => {
          dbUser = dbUser || 'root';
          
          rl.question('Mot de passe MySQL (laisser vide si aucun): ', (dbPassword) => {
            const envContent = `# Configuration du serveur
PORT=3000
NODE_ENV=development

# Configuration de la base de données
DB_HOST=localhost
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=restaurant_db

# JWT Secret
JWT_SECRET=secret_jwt_pour_api_restaurant
JWT_EXPIRES_IN=24h`;
            
            fs.writeFileSync(path.join(__dirname, '.env'), envContent);
            console.log('Fichier .env créé avec succès !');
            resolve(true);
          });
        });
      };
      
      askDBConfig();
    } else {
      console.log('Le fichier .env existe déjà.');
      resolve(true);
    }
  });
};

const startServer = () => {
  console.log('\nDémarrage du serveur API...');
  
  const server = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
  
  server.on('close', (code) => {
    if (code !== 0) {
      console.error(`Le serveur s'est arrêté avec le code : ${code}`);
    }
    rl.close();
  });
};

const runSetup = async () => {
  const dependenciesOk = await checkDependencies();
  if (!dependenciesOk) {
    console.error('Erreur lors de la configuration. Arrêt du script.');
    rl.close();
    return;
  }
  
  const envOk = await checkEnvFile();
  if (!envOk) {
    console.error('Erreur lors de la configuration du fichier .env. Arrêt du script.');
    rl.close();
    return;
  }
  
  rl.close();
  startServer();
};

runSetup();