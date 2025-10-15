import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Vehicle from './models/Vehicle.js';
import User from './models/User.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

/**
 * Sample customer data for seeding
 */
const customers = [
  {
    name: 'Test Customer',
    email: 'customer@test.com',
    password: 'password123',
    phone: '+91-9876543000',
    role: 'customer',
  },
];

/**
 * Sample vehicle owners data for seeding
 */
const vehicleOwners = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh@loadmate.com',
    password: 'password123',
    phone: '+91-9876543210',
    role: 'owner',
    vehicleOwnerDetails: {
      businessName: 'Rajesh Transport Services',
      licenseNumber: 'TS-2023-001',
      isVerified: true,
    },
  },
  {
    name: 'Priya Sharma',
    email: 'priya@loadmate.com',
    password: 'password123',
    phone: '+91-9876543211',
    role: 'owner',
    vehicleOwnerDetails: {
      businessName: 'Priya Logistics',
      licenseNumber: 'TS-2023-002',
      isVerified: true,
    },
  },
  {
    name: 'Amit Singh',
    email: 'amit@loadmate.com',
    password: 'password123',
    phone: '+91-9876543212',
    role: 'owner',
    vehicleOwnerDetails: {
      businessName: 'Amit Cargo Services',
      licenseNumber: 'TS-2023-003',
      isVerified: true,
    },
  },
  {
    name: 'Sunita Patel',
    email: 'sunita@loadmate.com',
    password: 'password123',
    phone: '+91-9876543213',
    role: 'owner',
    vehicleOwnerDetails: {
      businessName: 'Sunita Transport Co.',
      licenseNumber: 'TS-2023-004',
      isVerified: true,
    },
  },
  {
    name: 'Vikram Reddy',
    email: 'vikram@loadmate.com',
    password: 'password123',
    phone: '+91-9876543214',
    role: 'owner',
    vehicleOwnerDetails: {
      businessName: 'Vikram Heavy Transport',
      licenseNumber: 'TS-2023-005',
      isVerified: true,
    },
  },
];

/**
 * Sample vehicles data for seeding
 * Covers different load capacities and sizes
 */
const vehicles = [
  {
    type: 'Tata Ace',
    capacity: 750,
    dimensions: {
      length: 7,
      width: 4.5,
      height: 5,
    },
    baseFarePerKm: 12,
    loadingCharge: 200,
    description: 'Perfect for small loads and city deliveries. Most economical option for lightweight goods.',
    isAvailable: true,
    registrationNumber: 'TS-01-AB-1234',
    driverName: 'Ravi Kumar',
    driverPhone: '+91-9876543215',
    approvalStatus: 'approved',
  },
  {
    type: 'Tata Ace',
    capacity: 750,
    dimensions: {
      length: 7,
      width: 4.5,
      height: 5,
    },
    baseFarePerKm: 13,
    loadingCharge: 250,
    description: 'Perfect for small loads and city deliveries. Most economical option for lightweight goods.',
    isAvailable: true,
    registrationNumber: 'TS-01-CD-5678',
    driverName: 'Suresh Yadav',
    driverPhone: '+91-9876543216',
    approvalStatus: 'approved',
  },
  {
    type: 'Pickup Truck',
    capacity: 1500,
    dimensions: {
      length: 9,
      width: 5.5,
      height: 6,
    },
    baseFarePerKm: 18,
    loadingCharge: 300,
    description: 'Ideal for medium-sized goods transport. Popular choice for household shifting.',
    isAvailable: true,
    registrationNumber: 'TS-02-EF-9012',
    driverName: 'Manoj Singh',
    driverPhone: '+91-9876543217',
    approvalStatus: 'approved',
  },
  {
    type: 'Mini Truck',
    capacity: 2500,
    dimensions: {
      length: 12,
      width: 6,
      height: 7,
    },
    baseFarePerKm: 22,
    loadingCharge: 400,
    description: 'Great for larger loads and inter-city transport. Suitable for furniture and appliances.',
    isAvailable: true,
    registrationNumber: 'TS-03-GH-3456',
    driverName: 'Deepak Kumar',
    driverPhone: '+91-9876543218',
    approvalStatus: 'approved',
  },
  {
    type: 'Container Truck',
    capacity: 8000,
    dimensions: {
      length: 20,
      width: 8,
      height: 8.5,
    },
    baseFarePerKm: 35,
    loadingCharge: 800,
    description: 'Heavy-duty transport for large shipments. Ideal for commercial goods.',
    isAvailable: true,
    registrationNumber: 'TS-04-IJ-7890',
    driverName: 'Ramesh Patel',
    driverPhone: '+91-9876543219',
    approvalStatus: 'approved',
  },
  {
    type: 'Trailer',
    capacity: 15000,
    dimensions: {
      length: 32,
      width: 8,
      height: 9,
    },
    baseFarePerKm: 45,
    loadingCharge: 1200,
    description: 'Maximum capacity for bulk transport. Perfect for industrial and wholesale shipments.',
    isAvailable: true,
    registrationNumber: 'TS-05-KL-2468',
    driverName: 'Kiran Reddy',
    driverPhone: '+91-9876543220',
    approvalStatus: 'approved',
  },
];

/**
 * Import sample data into database
 */
const importData = async () => {
  try {
    // Clear existing data
    await Vehicle.deleteMany();
    await User.deleteMany({ role: { $in: ['owner', 'customer'] } });
    console.log('🗑️  Cleared existing vehicles, owners, and customers');

    // Create test customer
    const testCustomer = new User(customers[0]);
    await testCustomer.save();
    console.log('✅ Test customer created successfully');

    // Create vehicle owners one by one to trigger password hashing
    const createdOwners = [];
    for (const ownerData of vehicleOwners) {
      const owner = new User(ownerData);
      await owner.save();
      createdOwners.push(owner);
    }
    console.log('✅ Vehicle owners created successfully');
    console.log(`👥 Total owners: ${createdOwners.length}`);

    // Assign vehicles to owners
    const vehiclesWithOwners = vehicles.map((vehicle, index) => ({
      ...vehicle,
      owner: createdOwners[index % createdOwners.length]._id, // Distribute vehicles among owners
    }));

    // Insert vehicles with owner assignments
    await Vehicle.insertMany(vehiclesWithOwners);
    console.log('✅ Sample vehicles imported successfully');
    console.log(`📦 Total vehicles: ${vehiclesWithOwners.length}`);

    // Update owners with their vehicle references
    for (let i = 0; i < createdOwners.length; i++) {
      const ownerVehicles = vehiclesWithOwners.filter(
        (_, index) => index % createdOwners.length === i
      );
      await User.findByIdAndUpdate(createdOwners[i]._id, {
        'vehicleOwnerDetails.vehiclesOwned': ownerVehicles.map(v => v._id),
      });
    }
    console.log('✅ Owner-vehicle relationships established');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
};

/**
 * Delete all data from database
 */
const destroyData = async () => {
  try {
    await Vehicle.deleteMany();
    await User.deleteMany({ role: 'owner' });
    console.log('🗑️  All vehicles and owners deleted successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting data:', error);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}

// Usage:
// node seed.js       -> Import sample data
// node seed.js -d    -> Delete all data