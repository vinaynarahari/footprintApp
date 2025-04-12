-- Create business_classifications table
CREATE TABLE IF NOT EXISTS business_classifications (
  id SERIAL PRIMARY KEY,
  business_name VARCHAR(255) NOT NULL,
  industry VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on business_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_business_classifications_business_name ON business_classifications(business_name);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_business_classifications_created_at ON business_classifications(created_at); 