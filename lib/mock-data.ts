export const hotels = [
  {
    name: "Azure Bay Resort",
    slug: "azure-bay-resort",
    city: "Cox's Bazar",
    rating: 4.8,
    rooms: 42,
    price: "$120",
    image: "Ocean view",
    badge: "Tenant active",
  },
  {
    name: "Grand Palace Dhaka",
    slug: "grand-palace-dhaka",
    city: "Dhaka",
    rating: 4.6,
    rooms: 88,
    price: "$95",
    image: "Business stay",
    badge: "Popular",
  },
  {
    name: "Hilltop Heritage",
    slug: "hilltop-heritage",
    city: "Sylhet",
    rating: 4.7,
    rooms: 31,
    price: "$78",
    image: "Nature retreat",
    badge: "Promo live",
  },
];

export const rooms = [
  {
    name: "Deluxe King Suite",
    capacity: "2 adults",
    price: "Tk 12,000",
    status: "Available",
    amenities: ["King bed", "Sea view", "Breakfast"],
  },
  {
    name: "Family Garden Room",
    capacity: "4 guests",
    price: "Tk 16,500",
    status: "Few left",
    amenities: ["Two beds", "Balcony", "Kitchenette"],
  },
  {
    name: "Business Twin Room",
    capacity: "2 adults",
    price: "Tk 8,800",
    status: "Available",
    amenities: ["Workspace", "Fast Wi-Fi", "Late checkout"],
  },
];

export const bookings = [
  {
    guest: "Tanvir Hasan",
    email: "tanvir.hasan@example.com",
    phone: "+880 1712-345678",
    address: "House 14, Road 8, Dhanmondi, Dhaka",
    room: "Deluxe King Suite",
    roomCount: 1,
    date: "May 28 - May 31",
    status: "Confirmed",
    total: "Tk 36,000",
  },
  {
    guest: "Nadia Karim",
    email: "nadia.karim@example.com",
    phone: "+880 1811-223344",
    address: "Flat B3, 22 Agrabad C/A, Chattogram",
    room: "Family Garden Room",
    roomCount: 2,
    date: "Jun 2 - Jun 5",
    status: "Pending",
    total: "Tk 49,500",
  },
  {
    guest: "Rahim Uddin",
    email: "rahim.uddin@example.com",
    phone: "+880 1915-667788",
    address: "Zindabazar Main Road, Sylhet",
    room: "Business Twin Room",
    roomCount: 1,
    date: "Jun 8 - Jun 10",
    status: "Checked in",
    total: "Tk 17,600",
  },
];

export const customerTrips = [
  {
    hotel: "Azure Bay Resort",
    room: "Deluxe King Suite",
    date: "May 28 - May 31",
    status: "Upcoming",
    amount: "$378",
  },
  {
    hotel: "Grand Palace Dhaka",
    room: "Business Twin Room",
    date: "Apr 12 - Apr 14",
    status: "Completed",
    amount: "$194",
  },
  {
    hotel: "Hilltop Heritage",
    room: "Family Garden Room",
    date: "Jun 18 - Jun 21",
    status: "Pending payment",
    amount: "$495",
  },
];

export const customerStats = [
  { label: "Upcoming stays", value: "2", trend: "+1" },
  { label: "Reward points", value: "2,450", trend: "+320" },
  { label: "Saved hotels", value: "8", trend: "+3" },
  { label: "Total nights", value: "24", trend: "+6" },
];

export const tenantStats = [
  { label: "Occupancy", value: "78%", trend: "+12%" },
  { label: "Revenue", value: "$24.8k", trend: "+8%" },
  { label: "Bookings", value: "146", trend: "+19%" },
  { label: "Open requests", value: "12", trend: "-4%" },
];

export const superAdminStats = [
  { label: "Active hotels", value: "128", trend: "+9%" },
  { label: "Tenants", value: "96", trend: "+14%" },
  { label: "Platform revenue", value: "$82.4k", trend: "+22%" },
  { label: "Users", value: "18.2k", trend: "+31%" },
];
