export interface User {
  id: string;
  phone: string;
  name: string;
  agentCode: string;
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  joinedAt: string;
  status: 'active' | 'suspended';
}

export interface RewardProduct {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  image: string;
  category: string;
  stock: number;
}

export interface QRCode {
  id: string;
  code: string;
  productName: string;
  points: number;
  batchId: string;
  status: 'pending' | 'redeemed' | 'expired';
  redeemedBy?: string;
  redeemedAt?: string;
  createdAt: string;
}

export interface QRBatch {
  id: string;
  productName: string;
  pointsPerCode: number;
  totalCodes: number;
  redeemedCount: number;
  createdAt: string;
  codes: QRCode[];
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  pointsUsed: number;
  bankName: string;
  accountNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface RedemptionRequest {
  id: string;
  userId: string;
  userName: string;
  productName: string;
  pointsUsed: number;
  type: 'store_pickup' | 'delivery' | 'bank_withdrawal';
  status: 'pending' | 'approved' | 'dispatched' | 'completed' | 'rejected';
  storeAddress?: string;
  storePhone?: string;
  createdAt: string;
}

export interface AgentCode {
  id: string;
  code: string;
  usedBy?: string;
  used: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  type: 'scan' | 'redeem' | 'withdraw' | 'bonus' | 'deduction';
  description: string;
  points: number;
  createdAt: string;
}

// Mock data
export const mockUsers: User[] = [
  { id: '1', phone: '+91 98765 43210', name: 'Rajesh Kumar', agentCode: 'AG001', points: 1250, totalEarned: 3500, totalRedeemed: 2250, joinedAt: '2025-12-01', status: 'active' },
  { id: '2', phone: '+91 87654 32109', name: 'Priya Sharma', agentCode: 'AG002', points: 850, totalEarned: 2000, totalRedeemed: 1150, joinedAt: '2025-12-15', status: 'active' },
  { id: '3', phone: '+91 76543 21098', name: 'Amit Patel', agentCode: 'AG003', points: 2100, totalEarned: 5000, totalRedeemed: 2900, joinedAt: '2026-01-05', status: 'active' },
  { id: '4', phone: '+91 65432 10987', name: 'Sneha Gupta', agentCode: 'AG001', points: 300, totalEarned: 800, totalRedeemed: 500, joinedAt: '2026-01-20', status: 'suspended' },
];

export const mockRewardProducts: RewardProduct[] = [
  { id: '1', name: 'Glass Bottle', description: 'Premium quality glass water bottle 500ml', pointsCost: 50, image: '🍶', category: 'Household', stock: 150 },
  { id: '2', name: 'Measurement Tape 5m', description: 'Professional 5 meter measurement tape', pointsCost: 200, image: '📏', category: 'Tools', stock: 80 },
  { id: '3', name: 'LED Flashlight', description: 'Rechargeable LED flashlight with 3 modes', pointsCost: 350, image: '🔦', category: 'Tools', stock: 45 },
  { id: '4', name: 'Stainless Steel Lunch Box', description: '3-compartment stainless steel tiffin box', pointsCost: 500, image: '🍱', category: 'Kitchen', stock: 60 },
  { id: '5', name: 'Sports Water Bottle', description: '1L BPA-free sports bottle with straw', pointsCost: 100, image: '🥤', category: 'Sports', stock: 200 },
  { id: '6', name: 'Tool Kit Set', description: '12-piece home tool kit with carrying case', pointsCost: 800, image: '🧰', category: 'Tools', stock: 25 },
  { id: '7', name: 'Umbrella', description: 'Compact folding umbrella, wind-resistant', pointsCost: 150, image: '☂️', category: 'Accessories', stock: 100 },
  { id: '8', name: 'Power Bank 10000mAh', description: 'Dual USB output portable charger', pointsCost: 1000, image: '🔋', category: 'Electronics', stock: 30 },
];

export const mockQRBatches: QRBatch[] = [
  {
    id: 'batch-1',
    productName: 'Premium Cement 50kg',
    pointsPerCode: 25,
    totalCodes: 100,
    redeemedCount: 45,
    createdAt: '2026-01-15',
    codes: Array.from({ length: 100 }, (_, i) => ({
      id: `qr-1-${i}`,
      code: `CEM-${String(i + 1).padStart(4, '0')}`,
      productName: 'Premium Cement 50kg',
      points: 25,
      batchId: 'batch-1',
      status: i < 45 ? 'redeemed' as const : 'pending' as const,
      redeemedBy: i < 45 ? mockUsers[i % 4].name : undefined,
      redeemedAt: i < 45 ? '2026-02-10' : undefined,
      createdAt: '2026-01-15',
    })),
  },
  {
    id: 'batch-2',
    productName: 'Wall Putty 20kg',
    pointsPerCode: 15,
    totalCodes: 50,
    redeemedCount: 12,
    createdAt: '2026-02-01',
    codes: Array.from({ length: 50 }, (_, i) => ({
      id: `qr-2-${i}`,
      code: `WP-${String(i + 1).padStart(4, '0')}`,
      productName: 'Wall Putty 20kg',
      points: 15,
      batchId: 'batch-2',
      status: i < 12 ? 'redeemed' as const : 'pending' as const,
      createdAt: '2026-02-01',
    })),
  },
];

export const mockWithdrawals: WithdrawalRequest[] = [
  { id: 'w1', userId: '1', userName: 'Rajesh Kumar', amount: 500, pointsUsed: 500, bankName: 'SBI', accountNumber: '****4521', status: 'pending', createdAt: '2026-02-18' },
  { id: 'w2', userId: '3', userName: 'Amit Patel', amount: 1000, pointsUsed: 1000, bankName: 'HDFC', accountNumber: '****8832', status: 'approved', createdAt: '2026-02-15' },
  { id: 'w3', userId: '2', userName: 'Priya Sharma', amount: 300, pointsUsed: 300, bankName: 'ICICI', accountNumber: '****1190', status: 'rejected', createdAt: '2026-02-10' },
];

export const mockRedemptions: RedemptionRequest[] = [
  { id: 'r1', userId: '1', userName: 'Rajesh Kumar', productName: 'Glass Bottle', pointsUsed: 50, type: 'store_pickup', status: 'completed', storeAddress: '123 Main Market, Sector 22, Chandigarh', storePhone: '+91 172 270 0001', createdAt: '2026-02-10' },
  { id: 'r2', userId: '2', userName: 'Priya Sharma', productName: 'Measurement Tape 5m', pointsUsed: 200, type: 'store_pickup', status: 'pending', storeAddress: '456 Station Road, Ludhiana', storePhone: '+91 161 240 0055', createdAt: '2026-02-17' },
  { id: 'r3', userId: '3', userName: 'Amit Patel', productName: 'Power Bank 10000mAh', pointsUsed: 1000, type: 'delivery', status: 'dispatched', createdAt: '2026-02-14' },
];

export const mockAgentCodes: AgentCode[] = [
  { id: 'ac1', code: 'AG001', usedBy: 'Rajesh Kumar', used: true, createdAt: '2025-11-20' },
  { id: 'ac2', code: 'AG002', usedBy: 'Priya Sharma', used: true, createdAt: '2025-11-20' },
  { id: 'ac3', code: 'AG003', usedBy: 'Amit Patel', used: true, createdAt: '2025-12-10' },
  { id: 'ac4', code: 'AG004', used: false, createdAt: '2026-01-05' },
  { id: 'ac5', code: 'AG005', used: false, createdAt: '2026-01-05' },
];

export const mockActivity: ActivityLog[] = [
  { id: 'a1', userId: '1', type: 'scan', description: 'Scanned QR from Premium Cement 50kg', points: 25, createdAt: '2026-02-20' },
  { id: 'a2', userId: '1', type: 'redeem', description: 'Redeemed Glass Bottle', points: -50, createdAt: '2026-02-18' },
  { id: 'a3', userId: '1', type: 'scan', description: 'Scanned QR from Wall Putty 20kg', points: 15, createdAt: '2026-02-15' },
  { id: 'a4', userId: '1', type: 'bonus', description: 'Festival bonus from admin', points: 100, createdAt: '2026-02-12' },
  { id: 'a5', userId: '1', type: 'withdraw', description: 'Bank withdrawal requested', points: -500, createdAt: '2026-02-10' },
  { id: 'a6', userId: '1', type: 'scan', description: 'Scanned QR from Premium Cement 50kg', points: 25, createdAt: '2026-02-08' },
];

export const storeLocations = [
  { id: 's1', name: 'Main Branch Store', address: '123 Main Market, Sector 22, Chandigarh 160022', phone: '+91 172 270 0001', lat: 30.7333, lng: 76.7794 },
  { id: 's2', name: 'Station Road Store', address: '456 Station Road, Ludhiana 141001', phone: '+91 161 240 0055', lat: 30.9010, lng: 75.8573 },
  { id: 's3', name: 'City Center Store', address: '789 Mall Road, Amritsar 143001', phone: '+91 183 250 0088', lat: 31.6340, lng: 74.8723 },
];
