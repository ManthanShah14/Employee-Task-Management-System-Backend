npm init -y
npm i express cors cookie-parser dotenv pg nodemon jsonwebtoken bcryptjs

jwt_secret_key : node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"