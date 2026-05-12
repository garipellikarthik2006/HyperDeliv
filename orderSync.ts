// Shared Data Synchronization Layer for DabbaFlow
// Manages orders across User, Vendor, and Admin portals
 
export interface Order {
  id: string;
  type: "Food" | "Print";
  details: FoodDetails | PrintDetails;
  status: "Pending" | "Accepted" | "Ready" | "Delivered";
  customer: string;
  price: number;
  createdAt: string;
  vendorId?: string;
  vendorName?: string;
}
 
export interface FoodDetails {
  restaurant: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  deliveryLocation: string;
  specialInstructions?: string;
}
 
export interface PrintDetails {
  fileName: string;
  documentType: "bw" | "color";
  pageCount: number;
  fileSize: string;
  dropLocation: string;
  urgency?: "normal" | "urgent";
}
 
// localStorage key for shared orders
const ORDERS_STORAGE_KEY = 'dabbaflow_orders';
 
// Order Management Functions
export const OrderSync = {
  // Get all orders from localStorage
  getOrders(): Order[] {
    try {
      const orders = localStorage.getItem(ORDERS_STORAGE_KEY);
      return orders ? JSON.parse(orders) : [];
    } catch (error) {
      console.error('Error reading orders from localStorage:', error);
      return [];
    }
  },
 
  // Save orders to localStorage
  saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      // Dispatch custom event for same-tab listeners (storage event only fires cross-tab)
      window.dispatchEvent(new CustomEvent('dabbaflow_orders_updated', { detail: orders }));
    } catch (error) {
      console.error('Error saving orders to localStorage:', error);
    }
  },
 
  // Add a new order
  addOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      ...order,
      id: this.generateOrderId(order.type),
      createdAt: new Date().toISOString(),
    };
    
    orders.push(newOrder);
    this.saveOrders(orders);
    return newOrder;
  },
 
  // Update order status
  updateOrderStatus(orderId: string, status: Order['status']): boolean {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      this.saveOrders(orders); // moved this line inside the if condition
      return true;
    }
    return false;
  },
 
  // Generate unique order ID
  generateOrderId(type: Order['type']): string {
    const prefix = type === 'Food' ? 'FJ' : 'PJ';
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `#${prefix}${timestamp}${random}`;
  },
 
  // Get orders by type
  getOrdersByType(type: Order['type']): Order[] {
    return this.getOrders().filter(order => order.type === type);
  },
 
  // Get orders by status
  getOrdersByStatus(status: Order['status']): Order[] {
    return this.getOrders().filter(order => order.status === status);
  },
 
  // Get orders for specific vendor
  getOrdersForVendor(vendorId: string): Order[] {
    return this.getOrders().filter(order => order.vendorId === vendorId);
  },
 
  // Get statistics
  getStats() {
    const orders = this.getOrders();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.price, 0);
    const foodOrders = orders.filter(order => order.type === 'Food').length;
    const printOrders = orders.filter(order => order.type === 'Print').length;
    const pendingOrders = orders.filter(order => order.status === 'Pending').length;
    const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;
 
    return {
      totalOrders,
      totalRevenue,
      foodOrders,
      printOrders,
      pendingOrders,
      deliveredOrders,
    };
  }
};
 
// Event listener for cross-tab synchronization
export const setupOrderSyncListener = (callback: (orders: Order[]) => void) => {
  // Listen for storage changes across tabs
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === ORDERS_STORAGE_KEY && event.newValue) {
      try {
        const orders = JSON.parse(event.newValue);
        callback(orders);
      } catch (error) {
        console.error('Error parsing orders from storage event:', error);
      }
    }
  };
 
  // Listen for same-tab updates via custom event
  const handleCustomEvent = (event: Event) => {
    const orders = (event as CustomEvent).detail;
    if (Array.isArray(orders)) callback(orders);
  };
 
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('dabbaflow_orders_updated', handleCustomEvent);
 
  // Initial load
  callback(OrderSync.getOrders());
 
  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('dabbaflow_orders_updated', handleCustomEvent);
  };
};
 
// Mock vendor data for demonstration
export const mockVendors = [
  { id: 'vendor1', name: 'Campus Cafe', email: 'vendor@demo.com' },
  { id: 'vendor2', name: 'Print Shop', email: 'vendor@demo.com' },
];
 
// Helper to assign vendor to new orders
export const assignVendorToOrder = (order: Omit<Order, 'vendorId' | 'vendorName'>): Order => {
  const randomVendor = mockVendors[Math.floor(Math.random() * mockVendors.length)];
  return {
    ...order,
    vendorId: randomVendor.id,
    vendorName: randomVendor.name,
  };
};