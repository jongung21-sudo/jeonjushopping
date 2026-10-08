import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Order } from '../types';
import { Package, Truck, ExternalLink, X, ArrowLeft, CheckCircle2, RotateCcw, AlertTriangle, FileText, Printer } from 'lucide-react';

interface OrderHistoryPageProps {
  navigate: (path: string) => void;
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ navigate }) => {
  const { orders, updateOrderStatus, cancelOrder, requestRefund } = useAuth();
  const { showToast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // 환불/반품 모달 상태
  const [refundModalOrder, setRefundModalOrder] = useState<Order | null>(null);
  const [refundReasonType, setRefundReasonType] = useState('단순 변심 (왕복 배송비 5,000원 부담)');
  const [refundDetail, setRefundDetail] = useState('');
  const [refundBank, setRefundBank] = useState('국민은행');
  const [refundAccountNo, setRefundAccountNo] = useState('');
  const [refundHolder, setRefundHolder] = useState('');

  const handleConfirmPurchase = (orderId: string) => {
    updateOrderStatus(orderId, '구매확정');
    showToast('구매가 확정되었습니다. 정상 적립금이 지급되었습니다.');
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: '구매확정' });
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('정말 이 주문을 취소하시겠습니까? 결제금액 및 포인트가 환원됩니다.')) {
      cancelOrder(orderId, '고객 직접 주문 취소');
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: '주문취소' });
      }
    }
  };

  const handleOpenRefundModal = (order: Order) => {
    setRefundModalOrder(order);
    setRefundHolder(order.recipientName);
  };

  const handleSubmitRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalOrder) return;

    if (!refundAccountNo.trim() || !refundHolder.trim()) {
      showToast('환불받으실 계좌 정보를 정확히 입력해주세요.', 'error');
      return;
    }

    const fullReason = `[${refundReasonType}] ${refundDetail}`;
    requestRefund(refundModalOrder.id, fullReason, {
      bank: refundBank,
      accountNumber: refundAccountNo.trim(),
      holder: refundHolder.trim(),
    });

    setRefundModalOrder(null);
    setRefundDetail('');
    setRefundAccountNo('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex items-center justify-between pb-6 border-b border-paper-300">
        <div>
          <button
            onClick={() => navigate('/mypage')}
            className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-900 transition-colors mb-2 font-serif-kr"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>마이페이지로</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-serif-kr font-medium text-ink-900 tracking-wide">
            주문 및 배송 / 환불 관리 (ORDERS)
          </h1>
        </div>
        <span className="text-xs text-ink-500 font-serif-kr">총 {orders.length}건</span>
      </div>

      {orders.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-sm font-serif-kr text-ink-700">주문 내역이 존재하지 않습니다.</p>
          <button
            onClick={() => navigate('/shop')}
            className="mt-4 px-6 py-2.5 bg-ink-900 text-paper-100 text-xs font-semibold uppercase hover:bg-lacquer tracking-widest"
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
                  <span className={`px-2.5 py-1 text-xs font-medium border ${
                    order.status === '결제완료'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : order.status === '배송중'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : order.status === '배송완료'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : order.status === '반품신청' || order.status === '환불요청'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : order.status === '환불완료' || order.status === '주문취소'
                      ? 'bg-slate-100 text-slate-500 border-slate-300'
                      : 'bg-paper-200 text-ink-900 border-paper-300'
                  }`}>
                    {order.status}
                  </span>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-xs text-lacquer hover:underline ml-2 font-serif-kr"
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
                        className="w-14 h-18 object-cover bg-paper-300 flex-shrink-0 border border-paper-300"
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

              {/* Bottom Actions & Tracking */}
              <div className="pt-3 border-t border-paper-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-ink-600">
                  {order.trackingNumber ? (
                    <span className="flex items-center gap-1.5 text-blue-700 font-medium">
                      <Truck className="w-3.5 h-3.5" />
                      {order.trackingCarrier || 'CJ대한통운'} 송장: {order.trackingNumber}
                    </span>
                  ) : (
                    <span className="text-ink-400">송장 등록 준비 중</span>
                  )}
                  {order.refundReason && (
                    <span className="text-rose-600 ml-2">
                      (환불사유: {order.refundReason})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* 주문 취소 버튼 (결제완료 단계) */}
                  {order.status === '결제완료' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-3 py-1.5 border border-paper-400 text-ink-700 hover:text-lacquer hover:border-lacquer transition-colors"
                    >
                      주문 취소
                    </button>
                  )}

                  {/* 반품/환불 신청 버튼 (배송완료 단계) */}
                  {order.status === '배송완료' && (
                    <>
                      <button
                        onClick={() => handleOpenRefundModal(order)}
                        className="px-3 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        반품 / 환불 신청
                      </button>
                      <button
                        onClick={() => handleConfirmPurchase(order.id)}
                        className="px-3 py-1.5 bg-ink-900 text-paper-100 hover:bg-lacquer transition-colors"
                      >
                        구매 확정 (+1% 적립)
                      </button>
                    </>
                  )}

                  {order.status === '구매확정' && (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 구매확정 완료
                    </span>
                  )}

                  {order.status === '반품신청' && (
                    <span className="text-rose-600 flex items-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5" /> 반품 심사진행 중
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. 환불/반품 신청 모달 */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-paper-100 border border-paper-300 w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-paper-300">
              <h3 className="text-lg font-serif-kr font-medium text-ink-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-600" />
                반품 및 환불 신청
              </h3>
              <button onClick={() => setRefundModalOrder(null)} className="text-ink-500 hover:text-ink-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-800 font-serif-kr">
              주문번호: <strong>{refundModalOrder.orderNumber}</strong><br />
              환불 예정 금액: <strong className="text-lacquer">{refundModalOrder.finalPrice.toLocaleString()}원</strong> (포인트 결제분은 자동 복구됩니다)
            </div>

            <form onSubmit={handleSubmitRefund} className="space-y-4 text-xs font-serif-kr">
              <div>
                <label className="block text-ink-800 font-medium mb-1">반품/환불 사유 선택</label>
                <select
                  value={refundReasonType}
                  onChange={(e) => setRefundReasonType(e.target.value)}
                  className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 focus:outline-none focus:border-ink-900"
                >
                  <option value="단순 변심 (왕복 배송비 5,000원 부담)">단순 변심 (왕복 배송비 5,000원 차감)</option>
                  <option value="사이즈 및 핏감 불일치">사이즈 및 핏감 불일치</option>
                  <option value="상품 하자 및 불량 의심">상품 하자 및 불량 의심</option>
                  <option value="오배송 및 구성품 누락">오배송 및 구성품 누락</option>
                </select>
              </div>

              <div>
                <label className="block text-ink-800 font-medium mb-1">상세 사유 기재</label>
                <textarea
                  rows={3}
                  value={refundDetail}
                  onChange={(e) => setRefundDetail(e.target.value)}
                  placeholder="반품 사유를 구체적으로 적어주시면 신속하게 수거 및 검수가 진행됩니다."
                  className="w-full bg-paper-50 border border-paper-300 p-2.5 text-ink-900 focus:outline-none focus:border-ink-900"
                  required
                />
              </div>

              <div className="pt-3 border-t border-paper-300 space-y-2">
                <label className="block text-ink-800 font-medium">환불 대금 입금 계좌 정보</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={refundBank}
                    onChange={(e) => setRefundBank(e.target.value)}
                    className="bg-paper-50 border border-paper-300 px-2 py-2 text-ink-900"
                  >
                    <option value="국민은행">국민은행</option>
                    <option value="신한은행">신한은행</option>
                    <option value="우리은행">우리은행</option>
                    <option value="하나은행">하나은행</option>
                    <option value="카카오뱅크">카카오뱅크</option>
                    <option value="토스뱅크">토스뱅크</option>
                    <option value="농협은행">농협은행</option>
                  </select>
                  <input
                    type="text"
                    value={refundAccountNo}
                    onChange={(e) => setRefundAccountNo(e.target.value)}
                    placeholder="계좌번호 (- 제외)"
                    className="col-span-2 bg-paper-50 border border-paper-300 px-2.5 py-2 text-ink-900"
                    required
                  />
                </div>
                <input
                  type="text"
                  value={refundHolder}
                  onChange={(e) => setRefundHolder(e.target.value)}
                  placeholder="예금주 성명"
                  className="w-full bg-paper-50 border border-paper-300 px-2.5 py-2 text-ink-900"
                  required
                />
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setRefundModalOrder(null)}
                  className="flex-1 py-2.5 border border-paper-400 text-ink-700 hover:bg-paper-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-medium shadow-sm"
                >
                  반품 / 환불 접수
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 주문 상세서 팝업 모달 */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-paper-100 border border-paper-300 w-full max-w-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-paper-300">
              <div>
                <h3 className="text-lg font-serif-kr font-semibold text-ink-900">
                  주문 상세 명세서
                </h3>
                <p className="text-xs text-ink-500 font-sans mt-0.5">
                  {selectedOrder.orderNumber} ({selectedOrder.orderDate})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 border border-paper-400 text-ink-700 hover:bg-paper-200"
                  title="명세서 인쇄"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-ink-500 hover:text-ink-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 배송지 정보 */}
            <div className="bg-paper-50 p-4 border border-paper-200 text-xs space-y-1.5 font-serif-kr">
              <h4 className="font-semibold text-ink-900 mb-2">배송 정보</h4>
              <p><span className="text-ink-500">받는 분:</span> {selectedOrder.recipientName} ({selectedOrder.recipientPhone})</p>
              <p><span className="text-ink-500">주소:</span> [{selectedOrder.postalCode}] {selectedOrder.address} {selectedOrder.detailAddress}</p>
              {selectedOrder.deliveryMemo && (
                <p><span className="text-ink-500">배송 메모:</span> {selectedOrder.deliveryMemo}</p>
              )}
            </div>

            {/* 결제 요약 */}
            <div className="text-xs space-y-2 font-serif-kr border-t border-paper-200 pt-4">
              <div className="flex justify-between">
                <span>총 상품금액</span>
                <span className="font-sans font-medium">{selectedOrder.totalProductPrice.toLocaleString()}원</span>
              </div>
              {selectedOrder.couponDiscount ? (
                <div className="flex justify-between text-lacquer">
                  <span>쿠폰 할인 ({selectedOrder.couponCode})</span>
                  <span className="font-sans font-medium">-{selectedOrder.couponDiscount.toLocaleString()}원</span>
                </div>
              ) : null}
              {selectedOrder.usedPoints ? (
                <div className="flex justify-between text-bronze">
                  <span>포인트 사용</span>
                  <span className="font-sans font-medium">-{selectedOrder.usedPoints.toLocaleString()}P</span>
                </div>
              ) : null}
              <div className="flex justify-between font-bold text-ink-900 text-sm pt-2 border-t border-paper-300">
                <span>최종 결제 금액</span>
                <span className="text-lacquer font-sans text-base">{selectedOrder.finalPrice.toLocaleString()}원</span>
              </div>
              <div className="text-[11px] text-ink-400 pt-1">
                결제 수단: {selectedOrder.paymentMethod}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
