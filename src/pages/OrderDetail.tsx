import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import {
  Package,
  Truck,
  CheckCircle,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  CreditCard,
  Box,
  Send
} from 'lucide-react';

interface OrderItem {
  id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface Order {
  id: string;
  order_number: string;
  m_payment_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  fulfillment_type: 'collection' | 'delivery';
  status: string;
  payment_status: string;
  total: number;
  total_cents: number;
  placed_at: string;
  paid_at: string;
  created_at: string;
  delivery_address: any;
  collection_location: string;
  shipping_address: string;
  tracking_number: string;
  shipping_provider: string;
  order_items: OrderItem[];
}

const N8N_WEBHOOKS = {
  packed: 'https://dockerfile-1n82.onrender.com/webhook/order-ready-for-collection',
  out_for_delivery: 'https://dockerfile-1n82.onrender.com/webhook/out-for-delivery',
  collected: 'https://dockerfile-1n82.onrender.com/webhook/order-collected',
  delivered: 'https://dockerfile-1n82.onrender.com/webhook/order-delivered'
};

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    document.title = 'Order Detail - BLOM Cosmetics';
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/.netlify/functions/admin-orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const orders = await response.json();
      const foundOrder = orders.find((o: Order) => o.id === orderId);
      if (!foundOrder) {
        throw new Error('Order not found');
      }
      setOrder(foundOrder);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerN8nWebhook = async (status: string, order: Order) => {
    const webhookUrl = N8N_WEBHOOKS[status as keyof typeof N8N_WEBHOOKS];
    if (!webhookUrl) return;

    const payload = {
      order_id: order.id,
      order_number: order.order_number || order.m_payment_id,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      status: status,
      fulfillment_type: order.fulfillment_type,
      tracking_number: order.tracking_number,
      shipping_provider: order.shipping_provider
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('Failed to trigger n8n webhook:', err);
      // Don't throw - webhook failure shouldn't block the status update
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;

    setUpdating(true);
    setStatusMessage(null);

    try {
      // 1. Update order status in Supabase
      const response = await fetch('/.netlify/functions/admin-order-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_id: order.id,
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // 2. Trigger n8n webhook for notification (non-blocking)
      await triggerN8nWebhook(newStatus, order);

      // 3. Update local state
      setOrder({ ...order, status: newStatus });
      setStatusMessage({ type: 'success', text: 'Status updated & notification sent' });

      // Auto-clear success message after 3 seconds
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'packed':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'collected':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailableActions = (currentStatus: string, fulfillmentType: string) => {
    const actions = [];

    if (currentStatus === 'paid' && fulfillmentType === 'collection') {
      actions.push({ status: 'packed', label: 'Mark as Ready for Collection', icon: Box });
    }

    if (currentStatus === 'paid' && fulfillmentType === 'delivery') {
      actions.push({ status: 'packed', label: 'Mark as Packed', icon: Box });
    }

    if (currentStatus === 'packed' && fulfillmentType === 'delivery') {
      actions.push({ status: 'out_for_delivery', label: 'Mark as Out for Delivery', icon: Truck });
    }

    if (currentStatus === 'out_for_delivery') {
      actions.push({ status: 'delivered', label: 'Mark as Delivered', icon: CheckCircle });
    }

    if (currentStatus === 'packed' && fulfillmentType === 'collection') {
      actions.push({ status: 'collected', label: 'Mark as Collected', icon: CheckCircle });
    }

    return actions;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showMobileMenu={true} />
        <main className="section-padding">
          <Container>
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading order details...</p>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showMobileMenu={true} />
        <main className="section-padding">
          <Container>
            <div className="text-center py-16">
              <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
              <Button onClick={() => navigate('/admin/orders')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  const availableActions = getAvailableActions(order.status, order.fulfillment_type);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMobileMenu={true} />
      <main className="section-padding">
        <Container>
          <div className="max-w-5xl mx-auto">
            {/* Back button */}
            <button
              onClick={() => navigate('/admin/orders')}
              className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </button>

            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Order {order.order_number}
                  </h1>
                  <p className="text-gray-600">Payment ID: {order.m_payment_id}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {order.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Status message */}
            {statusMessage && (
              <div className={`mb-6 p-4 rounded-lg ${statusMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                {statusMessage.text}
              </div>
            )}

            {/* Action buttons */}
            {availableActions.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h2>
                <div className="flex flex-wrap gap-3">
                  {availableActions.map((action) => (
                    <Button
                      key={action.status}
                      onClick={() => updateOrderStatus(action.status)}
                      disabled={updating}
                      className="flex items-center"
                    >
                      <action.icon className="mr-2 h-4 w-4" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Name</div>
                      <div className="font-medium">{order.customer_name}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-medium">{order.customer_email}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Phone</div>
                      <div className="font-medium">{order.customer_phone}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fulfillment Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Fulfillment Details</h2>
                <div className="space-y-3">
                  <div className="flex items-start">
                    {order.fulfillment_type === 'delivery' ? (
                      <Truck className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                    ) : (
                      <Package className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                    )}
                    <div>
                      <div className="text-sm text-gray-600">Method</div>
                      <div className="font-medium capitalize">{order.fulfillment_type}</div>
                    </div>
                  </div>

                  {order.fulfillment_type === 'delivery' && order.shipping_address && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-600">Delivery Address</div>
                        <div className="font-medium">{order.shipping_address}</div>
                      </div>
                    </div>
                  )}

                  {order.fulfillment_type === 'collection' && order.collection_location && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-600">Collection Point</div>
                        <div className="font-medium">{order.collection_location}</div>
                      </div>
                    </div>
                  )}

                  {order.tracking_number && (
                    <div className="flex items-start">
                      <Package className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-600">Tracking Number</div>
                        <div className="font-medium">{order.tracking_number}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.order_items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.product_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.sku}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">R {Number(item.unit_price).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                          R {Number(item.line_total).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300">
                      <td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        Total:
                      </td>
                      <td className="px-4 py-3 text-right text-lg font-bold text-gray-900">
                        R {order.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600">Order Placed</div>
                    <div className="font-medium">
                      {new Date(order.placed_at).toLocaleString('en-ZA')}
                    </div>
                  </div>
                </div>
                {order.paid_at && (
                  <div className="flex items-start">
                    <CreditCard className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Payment Received</div>
                      <div className="font-medium">
                        {new Date(order.paid_at).toLocaleString('en-ZA')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
