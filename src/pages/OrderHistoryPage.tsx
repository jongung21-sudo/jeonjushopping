import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Order } from '../types';
import { Package, Truck, ExternalLink, X, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface OrderHistoryPageProps {
  navigate: (path: string) => void;
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ navigate }) => {
  const { orders, updateOrderStatus } = useAuth();
  const { showToast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleConfirmPurchase = (orderId: string) => {
    updateOrderStatus(orderId, '구매확정');
    showToast('구매가 확정되었습니다. 적립금이 정상 적립되었습니다.', 'success');
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: '구매확정' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex items-center justify-between pb-6 border-b border-paper-300">
        <div>
          <button
            onClick={() => navigate('/mypage')}
            className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>마이페이지로</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-serif-kr font-medium text-ink-900">
            주문 및 배송 조회 (ORDERS)
          </h1>
        </div>
        <span className="text-xs text-ink-500">총 {orders.length}건</span>
      </div>

      {orders.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-sm font-serif-kr text-ink-700">주문 내역이 존재하지 않습니다.</p>
          <button
            onClick={() => navigate('/shop')}
            className="mt-4 px-6 py-2.5 bg-ink-900 text-paper-100 text-xs font-semibold uppercase hover:bg-lacquer"
          >
            쇼핑하러 가기
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-paper-100 border border-paper-300 p-6 shadow-subtle space-y-4"
            >
              {/* Top Order Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-paper-300 gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-xs sm:text-sm text-ink-900 font-sans">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-ink-400 font-sans">| {order.orderDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-paper-200 border border-paper-300 text-ink-900">
                    {order.status}
                  </span>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-xs text-ink-700 hover:text-ink-900 underline ml-2"
                  >
                    주문상세서 보기
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-paper-200">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-18 object-cover bg-paper-300 flex-shrink-0"
                      />
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium font-serif-kr text-ink-900">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-ink-500 font-sans mt-0.5">
                          {item.color} / {item.size} · {item.quantity}개
                        </p>
                        <p className="text-xs font-semibold text-ink-900 font-sans mt-1">
                          {(item.price * item.quantity).toLocaleString()}원
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Meta & Actions */}
              <div className="pt-3 border-t border-paper-300 flex flex-col sm:flex-row justify-between sm:items-center text-xs text-ink-600 gap-3">
                <div className="space-y-0.5">
                  <p>
                    <span className="font-medium text-ink-800">배송지: </span>
                    {order.recipientName} ({order.address} {order.detailAddress})
                  </p>
                  {order.trackingNumber && (
                    <p className="flex items-center gap-1.5 text-bronze font-medium">
                      <Truck className="w-3.5 h-3.5" />
                      <span>운송장 번호: {order.trackingNumber}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {order.status === '배송완료' && (
                    <button
                      onClick={() => handleConfirmPurchase(order.id)}
                      className="px-3.5 py-1.5 bg-ink-900 text-paper-100 text-xs font-medium hover:bg-lacquer transition-colors"
                    >
                      구매 확정
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-3 py-1.5 border border-paper-400 text-xs text-ink-800 hover:border-ink-900"
                  >
                    배송 현황 조회
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative bg-paper-100 max-w-xl w-full p-6 sm:p-8 border border-paper-300 shadow-2xl z-10 animate-fade-in max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-paper-300">
              <div>
                <span className="text-[10px] tracking-widest text-bronze uppercase">
                  ORDER SPECIFICATION
                </span>
                <h3 className="text-base sm:text-lg font-serif-kr font-medium text-ink-900 mt-1">
                  주문서 상세 정보 ({selectedOrder.orderNumber})
                </h3>
                <p className="text-xs text-ink-400 font-sans">{selectedOrder.orderDate}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-ink-500 hover:text-ink-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Step */}
            <div className="p-3 bg-paper-200 border border-paper-300 flex justify-between items-center text-xs">
              <span className="text-ink-600">현재 주문 상태</span>
              <span className="font-semibold text-ink-900 font-serif-kr text-sm">
                {selectedOrder.status}
              </span>
            </div>

            {/* Recipient info */}
            <div className="text-xs space-y-2 border-b border-paper-300 pb-4">
              <h4 className="font-semibold text-ink-900 uppercase">배송지 정보</h4>
              <p>받는 분: {selectedOrder.recipientName} ({selectedOrder.recipientPhone})</p>
              <p>주소: ({selectedOrder.postalCode}) {selectedOrder.address} {selectedOrder.detailAddress}</p>
              {selectedOrder.deliveryMemo && <p>요청사항: {selectedOrder.deliveryMemo}</p>}
              {selectedOrder.trackingNumber && (
                <p className="text-bronze font-medium">송장 정보: {selectedOrder.trackingNumber}</p>
              )}
            </div>

            {/* Payment Summary */}
            <div className="text-xs space-y-1.5 border-b border-paper-300 pb-4">
              <h4 className="font-semibold text-ink-900 uppercase">결제 내역</h4>
              <div className="flex justify-between text-ink-600">
                <span>상품 금액</span>
                <span>{selectedOrder.totalProductPrice.toLocaleString()}원</span>
              </div>
              {selectedOrder.discountPrice > 0 && (
                <div className="flex justify-between text-lacquer">
                  <span>할인 금액</span>
                  <span>-{selectedOrder.discountPrice.toLocaleString()}원</span>
                </div>
              )}
              {selectedOrder.usedPoints > 0 && (
                <div className="flex justify-between text-lacquer">
                  <span>적립금 사용</span>
                  <span>-{selectedOrder.usedPoints.toLocaleString()}원</span>
                </div>
              )}
              <div className="flex justify-between text-ink-600">
                <span>배송비</span>
                <span>{selectedOrder.shippingFee === 0 ? '무료' : `${selectedOrder.shippingFee}원`}</span>
              </div>
              <div className="flex justify-between text-ink-900 font-semibold text-sm pt-2 border-t border-paper-200">
                <span>총 결제 금액</span>
                <span>{selectedOrder.finalPrice.toLocaleString()}원</span>
              </div>
              <p className="text-[11px] text-ink-500 pt-1">결제 수단: {selectedOrder.paymentMethod}</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-ink-900 text-paper-100 text-xs font-semibold uppercase hover:bg-lacquer"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
