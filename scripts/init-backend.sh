#!/bin/bash

# RepoHub Backend Initialization Script
# This script sets up the database and initializes the backend

set -e

echo "🚀 Initializing RepoHub Backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-repohub}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"

# Check if PostgreSQL is running
echo -e "\n${YELLOW}🔍 Checking PostgreSQL connection...${NC}"
if ! pg_isready -h $DB_HOST -p $DB_PORT; then
    echo -e "${RED}❌ PostgreSQL is not running on $DB_HOST:$DB_PORT${NC}"
    echo "Please start PostgreSQL and try again."
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"

# Check if database exists
echo -e "\n${YELLOW}🗄️ Checking database...${NC}"
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo -e "${GREEN}✅ Database '$DB_NAME' already exists${NC}"
else
    echo -e "${YELLOW}⚠️ Database '$DB_NAME' does not exist. Creating...${NC}"
    createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
    echo -e "${GREEN}✅ Database '$DB_NAME' created${NC}"
fi

# Check if tables exist
echo -e "\n${YELLOW}📊 Checking database tables...${NC}"
TABLES_EXIST=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'platforms');")

if [ "$TABLES_EXIST" = "t" ]; then
    echo -e "${GREEN}✅ Database tables already exist${NC}"
    read -p "Do you want to reset the database? This will delete all data. (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🔄 Resetting database...${NC}"
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f src/lib/database/schema.sql
        echo -e "${GREEN}✅ Database reset completed${NC}"
    else
        echo -e "${BLUE}ℹ️ Keeping existing data${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Database tables do not exist. Creating schema...${NC}"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f src/lib/database/schema.sql
    echo -e "${GREEN}✅ Database schema created${NC}"
fi

# Check if node_modules exists
echo -e "\n${YELLOW}📦 Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️ Dependencies not found. Installing...${NC}"
    pnpm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already exist${NC}"
fi

# Check if .env file exists
echo -e "\n${YELLOW}⚙️ Checking environment configuration...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️ .env file not found. Creating from example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️ Please edit .env file with your database credentials${NC}"
    echo "   Current configuration:"
    echo "   DB_HOST=$DB_HOST"
    echo "   DB_PORT=$DB_PORT"
    echo "   DB_NAME=$DB_NAME"
    echo "   DB_USER=$DB_USER"
    echo "   DB_PASSWORD=$DB_PASSWORD"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Test database connection
echo -e "\n${YELLOW}🔗 Testing database connection...${NC}"
if pnpm run test:db 2>/dev/null; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${YELLOW}⚠️ Database connection test failed. This is expected if test script doesn't exist yet.${NC}"
fi

# Display next steps
echo -e "\n${GREEN}🎉 Backend initialization completed!${NC}"
echo -e "\n${BLUE}📋 Next steps:${NC}"
echo "1. Review and update .env file if needed"
echo "2. Start the development server:"
echo "   ${YELLOW}pnpm dev${NC}"
echo "3. Test the API endpoints:"
echo "   ${YELLOW}curl http://localhost:3000/api/platforms${NC}"
echo "4. Sync Ubuntu packages:"
echo "   ${YELLOW}curl -X POST http://localhost:3000/api/sync -H 'Content-Type: application/json' -d '{\"platform_id\": \"ubuntu\"}'${NC}"

echo -e "\n${GREEN}✨ Ready to start development!${NC}"
