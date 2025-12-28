# Environment Setup

To set up your Felix Shtein Wall Art Shop, you need to create a `.env` file in the project root with the following variables:

```env
# Supabase PostgreSQL Database URL
# Get from: Supabase Dashboard -> Project Settings -> Database -> Connection string (URI)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# JWT Secret for admin authentication (generate a random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# PayPal Configuration
# Get from: https://developer.paypal.com/dashboard/applications
NEXT_PUBLIC_PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"

# Sandbox mode (set to "live" for production)
PAYPAL_MODE="sandbox"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Default shipping cost in USD
SHIPPING_COST_USD=10
```

## Setup Steps

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy the connection string from Project Settings > Database

2. **Create PayPal Developer Account**
   - Go to [developer.paypal.com](https://developer.paypal.com)
   - Create an app in sandbox mode
   - Copy Client ID and Secret

3. **Run Database Migrations**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Seed Initial Data**
   ```bash
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```
