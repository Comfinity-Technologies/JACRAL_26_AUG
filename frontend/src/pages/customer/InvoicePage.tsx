import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import { Printer, ArrowLeft } from "lucide-react";

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Order {
  id: number;
  status: string;
  payment_status: string;
  total_amount: number;
  discount_amount?: number;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  created_at: string;
  items: OrderItem[];
}

// Simple number to words converter (for Indian Rupees)
function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + inWords(n % 10000000) : "");
  };
  return inWords(num) + " Only";
}

export default function InvoicePage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const fetchOrder = async () => {
      try {
        const res = await apiClient.get(`/api/v1/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Failed to load invoice", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, isAuthenticated, navigate]);

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex justify-center items-center">Loading Invoice...</div>;
  }

  if (!order) {
    return <div className="min-h-screen bg-gray-100 flex justify-center items-center">Invoice not found.</div>;
  }

  const orderDate = new Date(order.created_at);
  const invoiceDate = new Date(); // In a real system, invoice date might be fixed at shipping time.

  // The template specifies an Amazon-like style.
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 font-sans text-gray-800">
      
      {/* Controls (Hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center print:hidden">
        <button 
          onClick={() => navigate("/account")}
          className="flex items-center gap-2 text-[#3B6E4C] hover:underline font-semibold"
        >
          <ArrowLeft size={16} /> Back to Orders
        </button>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-[#E88D36] text-white px-4 py-2 rounded shadow hover:bg-[#D47E2A]"
        >
          <Printer size={16} /> Print Invoice
        </button>
      </div>

      {/* Invoice Document */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-md border border-gray-200">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
          <div>
            <h1 className="text-3xl font-bold font-serif mb-1">JACRAL</h1>
            <p className="text-sm font-semibold tracking-widest uppercase">Tax Invoice/Bill of Supply/Cash Memo</p>
            <p className="text-xs text-gray-500">(Original for Recipient)</p>
          </div>
          <div className="text-right">
            <p className="text-sm"><strong>Order Number:</strong> {order.id}</p>
            <p className="text-sm"><strong>Order Date:</strong> {orderDate.toLocaleDateString('en-IN')}</p>
            <p className="text-sm"><strong>Invoice Date:</strong> {invoiceDate.toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="flex flex-col sm:flex-row justify-between mb-8 text-sm gap-8">
          <div className="w-full sm:w-1/2">
            <h3 className="font-bold border-b border-gray-300 pb-1 mb-2">Sold By:</h3>
            <p><strong>JACRAL Foods Pvt. Ltd.</strong></p>
            <p>123 Healthy Avenue, 4th Block</p>
            <p>Bengaluru, Karnataka - 560001, IN</p>
            <p className="mt-2"><strong>PAN No:</strong> ABCD1234E</p>
            <p><strong>GST Registration No:</strong> 29ABCD1234E1Z5</p>
          </div>
          <div className="w-full sm:w-1/2">
            <h3 className="font-bold border-b border-gray-300 pb-1 mb-2">Billing & Shipping Address:</h3>
            <p><strong>{order.shipping_name}</strong></p>
            <p className="whitespace-pre-line">{order.shipping_address}</p>
            <p className="mt-1">Ph: {order.shipping_phone}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-left">Sl. No</th>
                <th className="border border-black p-2 text-left">Description</th>
                <th className="border border-black p-2 text-right">Unit Price</th>
                <th className="border border-black p-2 text-right">Qty</th>
                <th className="border border-black p-2 text-right">Net Amount</th>
                <th className="border border-black p-2 text-right">Tax Type</th>
                <th className="border border-black p-2 text-right">Tax Amount</th>
                <th className="border border-black p-2 text-right font-bold">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => {
                const subtotal = Number(item.subtotal);
                // Simple mock tax breakdown: Assuming 5% IGST or CGST+SGST, included in price.
                // For this example, we'll just say the price includes 5% GST.
                const priceWithoutTax = subtotal / 1.05;
                const tax = subtotal - priceWithoutTax;
                
                return (
                  <tr key={item.id}>
                    <td className="border border-black p-2">{idx + 1}</td>
                    <td className="border border-black p-2 font-medium">{item.product_name}</td>
                    <td className="border border-black p-2 text-right">₹{Number(item.unit_price).toFixed(2)}</td>
                    <td className="border border-black p-2 text-right">{item.quantity}</td>
                    <td className="border border-black p-2 text-right">₹{priceWithoutTax.toFixed(2)}</td>
                    <td className="border border-black p-2 text-right">IGST 5%</td>
                    <td className="border border-black p-2 text-right">₹{tax.toFixed(2)}</td>
                    <td className="border border-black p-2 text-right font-bold">₹{subtotal.toFixed(2)}</td>
                  </tr>
                );
              })}
              
              {order.discount_amount && Number(order.discount_amount) > 0 && (
                 <tr>
                    <td className="border border-black p-2" colSpan={7} style={{textAlign: "right"}}>Discount</td>
                    <td className="border border-black p-2 text-right font-bold text-red-600">-₹{Number(order.discount_amount).toFixed(2)}</td>
                 </tr>
              )}

              <tr>
                <td className="border border-black p-2 font-bold" colSpan={7} style={{textAlign: "right"}}>TOTAL:</td>
                <td className="border border-black p-2 text-right font-bold text-lg">₹{Number(order.total_amount).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in words & Signature */}
        <div className="flex flex-col sm:flex-row justify-between items-end mb-8 text-sm gap-8">
          <div className="w-full sm:w-2/3">
            <p><strong>Amount in Words:</strong></p>
            <p className="italic font-medium">Rupees {numberToWords(Math.round(Number(order.total_amount)))}</p>
          </div>
          <div className="w-full sm:w-1/3 text-right">
            <h4 className="font-bold mb-8">For JACRAL Foods Pvt. Ltd.</h4>
            <p className="border-t border-black pt-1 inline-block">Authorized Signatory</p>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-4 mt-8">
          <p>Whether tax is payable under reverse charge - No</p>
          <p>This is a computer generated invoice and does not require a physical signature.</p>
        </div>

      </div>
    </div>
  );
}
