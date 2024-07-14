  # backend for live chat application 
   This is a backend for the live chat appilication 

  steps
   1. npm init
   2. create git repository
   3. install nodemon ( restarting server)
   4. create app.js ,constants.js and index.js
   5. create model controllers db routes utils folder in src 
   6. install prettier package and create .prettierrc and .prettierignore
   7. install mongoose and express
    
   8. create project in in mongo db atlas and do needed things like ipaddress and user name password copy (we need to take care of network access and database access)
   9. add environment variable in .env file (PORT AND MONGODB_URL)
   10. add db_name in constants file
   11. create method for db connectionin db folder index.js( iify function )
   12. install dotenv package
   13. create ApiError and ApiResponse class for send the data in  structured way 
   14. use then and catch to ad event listener to our app in then and throw error in catch in index.js files
   15. install cookie-parser and cors npm package  and configure them using use method of express app (in env file we create cors_origin = * but we need to write url of frontend where we want to add this server ex=http//localhost:3000)
   16. configuration for json file,urlencoded data,express.static() for store static file in static folder named as public
   17. create user model and its method(verify password ,hash password, generate accessToken and generate refreshToken(using))
   18. install jwt for generate access token and refresh token  . install bcrypt to hash password and verify
   19. create message model with id ,sender id,receiver id timestamp,content and isSeen
   20. create chat model with id, participiant, message array with message id ,timestamps
   21. for  form-data install and  configure multer middleware 
   22. To store  the avatar image on cloudinary intstall cloudinary and configure it. and create a method to uplaod file  
     on
   23. create user controller  (registerUser )
   24. add user route 
   

### todo 
   read abt process

### info 
 to use experimental feature we write in our script in package.json in dev command (dotenv/config for use type module use to import )(-r dotenv/config  --experimental-json-modules) with previous 