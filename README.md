# SupaShop API

## Overview
This is an Express application that provides an API for **SupaShop**. It includes Swagger documentation for easy exploration and testing of the API endpoints.


## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher) / yarn
- Prisma (for database interactions)

## Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/Apus-Industries-Limited/supa-shop-backend.git
    ```

2. Navigate to the project directory:
    ```sh
    cd supa-shop-backend
    ```

3. Install the dependencies:
    ```sh
    npm install
    ```
      or
      ```sh
    yarn install
    ```

4. Set up the environment variables. Create a `.env` file in the root directory and add the following:
    ```env
      ACCESS_TOKEN_SECRET = "Your secret access string"

      REFRESH_TOKEN_SECRET = Yoursecret refresh token key

      DATABASE_URL ="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"

      PSWD_RESET_TOKEN = "A PSWD RESET_TOKEN"

      HOST_MAIL = Email host address

      MAIL_PORT = Email host port

      EMAIL = Email address

      PASSWORD = Email Password

      FRONTEND_URL = Fronted Url
    ```

5. Set up Prisma:
    ```sh
    npx prisma generate
    npx prisma migrate deploy
    ```
    or

    ```sh
    yarn prisma generate
    yarn prisma migrate deploy
    ```

## Running the Application
1. Start the server:
    ```sh
    npm start
    ```
      or
      ```sh
    yarn start
    ```

2. The server will be running on the port specified in your `.env` file (default is 3500). You can access the API at:
    ```
    http://localhost:3000/
    ```

3. The Swagger API documentation will be available at:
    ```
    http://localhost:3500/docs
    ```


## Development
- To run the application in development mode:
    ```sh
    npm start
    ```
     or

     ```sh
      yarn start
    ```

## Contributing
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a pull request.

## License
This project is licensed under the Unlicense.

## Contact
- Author: Apus Industries Limited
- Email: joinsupashop@gmail.com
- GitHub: [SupaShop](https://github.com/Apus-Industries-Limited/supa-shop-backend)

