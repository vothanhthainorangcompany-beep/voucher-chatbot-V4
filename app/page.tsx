'use client';

import React, { useMemo, useRef, useState } from 'react';

const API_URL = '/api/voucher';

const EMPLOYEES = [
  { id: 'E001', name: 'Lan Anh', role: 'Staff', branchId: 'B001' },
  { id: 'E002', name: 'Minh Khoa', role: 'Shift Leader', branchId: 'B001' },
];

const BRANCHES = [
  {
    id: 'B001',
    code: '1',
    name: 'Aeon Bình Tân',
    scope: 'Aeon Bình Tân',
    aliases: ['1', 'aeon bình tân', 'aeon binh tan', 'aeon binh tân'],
  },
  {
    id: 'B002',
    code: '2',
    name: 'Vincom Gò Vấp',
    scope: 'Vincom Gò Vấp',
    aliases: ['2', 'vincom gò vấp', 'vincom go vap'],
  },
  {
    id: 'B003',
    code: '3',
    name: 'Vũng Tàu',
    scope: 'Vũng Tàu',
    aliases: ['3', 'vũng tàu', 'vung tau'],
  },
  {
    id: 'B004',
    code: '4',
    name: 'Vinh',
    scope: 'Vinh',
    aliases: ['4', 'vinh'],
  },
];

const CONVERSATIONS = [
  { id: 'C001', name: 'Khách nhận voucher', subtitle: 'Chat bot xác thực voucher', online: true },
  { id: 'C002', name: 'Lịch sử tra cứu', subtitle: 'Giao dịch gần đây', online: false },
  { id: 'C003', name: 'Cảnh báo', subtitle: 'Theo dõi bất thường', online: false },
];

type ChatRole = 'bot' | 'customer' | 'system';

type ChatItem = {
  role: ChatRole;
  text: string;
  time: string;
};

type Branch = {
  id: string;
  code: string;
  name: string;
  scope: string;
  aliases: string[];
};

type Employee = {
  id: string;
  name: string;
  role: string;
  branchId: string;
};

type VoucherApiResponse = {
  ok: boolean;
  message: string;
  tx_id?: string;
  voucher_code?: string;
  status?: 'UNUSED' | 'USED' | 'EXPIRED';
  branch_scope?: string;
};

type TransactionItem = {
  txId: string;
  branchName: string;
  branchScope: string;
  voucherToken: string;
  voucherCode: string;
  result: 'approved' | 'rejected';
  reason: string;
  time: string;
};

type FlowState = 'awaiting_branch' | 'awaiting_image' | 'awaiting_token' | 'done';

const INITIAL_CHAT: Omit<ChatItem, 'time'>[] = [
  {
    role: 'bot',
    text: 'Xin chào anh/chị. Hệ thống sẽ hỗ trợ nhận lại mã voucher đầy đủ từ voucher giấy.',
  },
  {
    role: 'bot',
    text: 'Bước 1: Vui lòng chọn chi nhánh áp dụng. Nhập 1 = Aeon Bình Tân, 2 = Vincom Gò Vấp, 3 = Vũng Tàu, 4 = Vinh.',
  },
];

function formatChatTime() {
  return new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime() {
  return new Date().toLocaleString('vi-VN');
}

function normalizeText(value: string) {
  return String(value || '').trim().toLowerCase();
}

function normalizeToken(value: string) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function resolveBranch(input: string) {
  const normalized = normalizeText(input);
  return BRANCHES.find((branch) => branch.aliases.includes(normalized)) || null;
}

function buildTxId(sequence: number) {
  const now = new Date();
  return `TX${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}${String(sequence).padStart(4, '0')}`;
}

async function requestVoucherFromSheet(payload: {
  customer_name: string;
  customer_phone: string;
  branch_scope: string;
  image_ref: string;
  voucher_token: string;
}) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  try {
    return JSON.parse(text) as VoucherApiResponse;
  } catch {
    return {
      ok: false,
      message: text || 'Không đọc được phản hồi từ hệ thống.',
    } satisfies VoucherApiResponse;
  }
}

export default function VoucherChatbotMVP() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [employeeId, setEmployeeId] = useState('E001');
  const [activeConversationId, setActiveConversationId] = useState('C001');

  const [chat, setChat] = useState<ChatItem[]>(
    INITIAL_CHAT.map((item) => ({ ...item, time: formatChatTime() }))
  );

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const [customerInput, setCustomerInput] = useState('');
  const [flowState, setFlowState] = useState<FlowState>('awaiting_branch');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [voucherImage, setVoucherImage] = useState<File | null>(null);
  const [voucherToken, setVoucherToken] = useState('');

  const currentEmployee = useMemo<Employee>(() => {
    return EMPLOYEES.find((item) => item.id === employeeId) || EMPLOYEES[0];
  }, [employeeId]);

  const selectedConversation = useMemo(() => {
    return CONVERSATIONS.find((item) => item.id === activeConversationId) || CONVERSATIONS[0];
  }, [activeConversationId]);

  const isWaitingForImage = flowState === 'awaiting_image';
  const isWaitingForToken = flowState === 'awaiting_token';

  const appendChat = (role: ChatRole, text: string) => {
    setChat((prev) => [...prev, { role, text, time: formatChatTime() }]);
  };

  const resetAll = () => {
    setChat(INITIAL_CHAT.map((item) => ({ ...item, time: formatChatTime() })));
    setTransactions([]);
    setLoading(false);
    setResult(null);
    setCustomerInput('');
    setFlowState('awaiting_branch');
    setSelectedBranch(null);
    setVoucherImage(null);
    setVoucherToken('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const runVoucherRequest = async ({
    branch,
    image,
    token,
  }: {
    branch: Branch | null;
    image: File | null;
    token: string;
  }) => {
    if (!branch) {
      const message = 'Anh/chị vui lòng chọn chi nhánh áp dụng trước khi tiếp tục.';
      appendChat('system', message);
      setResult({ ok: false, message });
      return { ok: false, message };
    }

    if (!image) {
      const message = 'Anh/chị vui lòng tải ảnh voucher trước khi tiếp tục.';
      appendChat('system', message);
      setResult({ ok: false, message });
      return { ok: false, message };
    }

    if (!token || token.length !== 10) {
      const message = '10 ký tự đầu chưa hợp lệ. Anh/chị vui lòng nhập đúng đủ 10 ký tự trên voucher giấy.';
      appendChat('system', message);
      setResult({ ok: false, message });
      return { ok: false, message };
    }

    appendChat('system', 'Hệ thống đang kiểm tra voucher của anh/chị. Vui lòng chờ trong giây lát.');

    setLoading(true);

    try {
      const apiResult = await requestVoucherFromSheet({
        customer_name: '',
        customer_phone: '',
        branch_scope: branch.scope,
        image_ref: image.name,
        voucher_token: token,
      });

      const transaction: TransactionItem = {
        txId: apiResult.tx_id || buildTxId(transactions.length + 1),
        branchName: branch.name,
        branchScope: branch.scope,
        voucherToken: token,
        voucherCode: apiResult.voucher_code || '',
        result: apiResult.ok ? 'approved' : 'rejected',
        reason: apiResult.message || '',
        time: formatDateTime(),
      };

      setTransactions((prev) => [transaction, ...prev]);

      if (apiResult.ok && apiResult.voucher_code) {
  const message = `Voucher của anh/chị đã được xác nhận thành công. Mã voucher đầy đủ là: ${apiResult.voucher_code}`;
  appendChat('system', message);
  setResult({ ok: true, message });
  return { ok: true, voucherCode: apiResult.voucher_code };
}

      const message = apiResult.message || 'Hiện hệ thống chưa thể cấp mã voucher. Anh/chị vui lòng thử lại sau.';
      appendChat('system', message);
      setResult({ ok: false, message });
      return { ok: false, message };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi kết nối hệ thống.';
      appendChat('system', message);
      setResult({ ok: false, message });
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSend = async () => {
    const rawMessage = customerInput.trim();
    if (!rawMessage || loading || isWaitingForImage) return;

    appendChat('customer', rawMessage);
    setCustomerInput('');

    if (flowState === 'awaiting_branch') {
      const branch = resolveBranch(rawMessage);

      if (!branch) {
        appendChat(
          'bot',
          'Em chưa nhận ra chi nhánh. Anh/chị vui lòng nhập 1, 2, 3, 4 hoặc tên chi nhánh đúng theo hướng dẫn.'
        );
        return;
      }

      setSelectedBranch(branch);
      setFlowState('awaiting_image');

      appendChat(
        'bot',
        `Anh/chị đã chọn ${branch.name}. Bước 2: vui lòng tải ảnh voucher ở khung bên dưới.`
      );
      return;
    }

    if (flowState === 'awaiting_token') {
      const normalizedToken = normalizeToken(rawMessage);

      if (normalizedToken.length !== 10) {
        appendChat(
          'bot',
          '10 ký tự đầu chưa hợp lệ. Anh/chị vui lòng nhập đúng đủ 10 ký tự trên voucher giấy.'
        );
        return;
      }

      setVoucherToken(normalizedToken);

      appendChat(
  'bot',
  `Em đã nhận 10 ký tự đầu: ${normalizedToken}. Hệ thống đang đối chiếu để trả mã đầy đủ.`
);

      const response = await runVoucherRequest({
        branch: selectedBranch,
        image: voucherImage,
        token: normalizedToken,
      });

      setFlowState('done');

      if (response.ok) {
  appendChat(
    'bot',
    `Anh/chị đã xác nhận voucher thành công. Mã voucher đầy đủ của anh/chị là: ${response.voucherCode}`
  );
} else {
  appendChat(
    'bot',
    `Rất tiếc, hiện hệ thống chưa thể hỗ trợ cấp mã. Thông tin từ hệ thống: ${response.message}`
  );
}

      return;
    }

    appendChat('bot', 'Phiên này đã hoàn tất. Anh/chị bấm “Mới” để bắt đầu tra cứu lại.');
  };

  const handleVoucherImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || loading) return;

    setVoucherImage(file);
    appendChat('customer', `Đã tải ảnh voucher: ${file.name}`);

    if (flowState !== 'awaiting_image') {
      appendChat('bot', 'Em đã nhận ảnh. Anh/chị tiếp tục làm theo hướng dẫn trong khung chat.');
      return;
    }

    setFlowState('awaiting_token');
    appendChat(
      'bot',
      'Bước 3: vui lòng nhập đúng 10 ký tự đầu trên voucher giấy để hệ thống đối chiếu.'
    );
  };

  const badgeClass = (ok: boolean) => {
    return ok
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className="h-dvh bg-slate-100 p-2 md:p-3">
      <div className="mx-auto h-full max-w-[1600px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="grid h-full grid-cols-12">
          <aside className="hidden">
            <div className="border-b px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Life4Cuts Voucher Bot</h1>
                  <p className="text-sm text-slate-500">Tra voucher từ Google Sheet</p>
                </div>
                <button
                  onClick={resetAll}
                  className="rounded-full border px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Mới
                </button>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-500">
                Luồng: Chọn chi nhánh → Tải ảnh voucher → Nhập 10 ký tự đầu → Trả full mã
              </div>
            </div>

            <div className="h-[calc(100%-113px)] overflow-auto p-2">
              {CONVERSATIONS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveConversationId(item.id)}
                  className={`mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                    activeConversationId === item.id ? 'bg-slate-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {item.name.slice(0, 2).toUpperCase()}
                    {item.online ? (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-slate-900">{item.name}</div>
                    <div className="truncate text-sm text-slate-500">{item.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <main className="col-span-12 flex min-h-0 h-full overflow-hidden flex-col">
            <div className="shrink-0 flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-semibold text-white shadow-sm">
  ✦
</div>
                <div>
                  <div className="font-semibold text-slate-900">Life4Cuts Voucher</div>
                  <div className="text-sm text-slate-500">Phản hồi tự động</div>
                </div>
              </div>

              <div className="text-sm text-slate-500">Đang hoạt động</div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-4 py-4 pb-2">
              <div className="mx-auto flex max-w-2xl flex-col gap-2.5 pb-2">
                {chat.map((msg, idx) => (
                  <div
                    key={`${msg.role}-${idx}`}
                    className={`flex ${
                      msg.role === 'bot' || msg.role === 'system'
                        ? 'justify-start'
                        : 'justify-end'
                    }`}
                  >
                    <div
                      className={`max-w-[72%] rounded-3xl px-4 py-3 text-[15px] leading-6 ${
                        msg.role === 'bot'
  ? 'rounded-2xl bg-white text-slate-800 shadow-sm border border-slate-200 rounded-bl-md'
  : msg.role === 'system'
    ? 'rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 rounded-bl-md'
    : 'rounded-2xl bg-blue-600 text-white rounded-br-md shadow-sm'
                      }`}
                    >
                      <div>{msg.text}</div>
                      <div className="mt-1 text-[10px] opacity-50">{msg.time}</div>
                    </div>
                  </div>
                ))}

                {loading ? (
                  <div className="inline-flex max-w-fit rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
                    Đang kiểm tra dữ liệu voucher trong Google Sheet...
                  </div>
                ) : null}

                {result ? (
                  <div
                    className={`inline-flex max-w-fit rounded-2xl border px-4 py-2 text-sm ${badgeClass(
                      result.ok
                    )}`}
                  >
                    {result.message}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-2">
              <div className="mx-auto max-w-3xl">
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setCustomerInput('1')}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    Aeon Bình Tân
                  </button>
                  <button
                    onClick={() => setCustomerInput('2')}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    Vincom Gò Vấp
                  </button>
                  <button
                    onClick={() => setCustomerInput('3')}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    Vũng Tàu
                  </button>
                  <button
                    onClick={() => setCustomerInput('1688870994')}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    Mã mẫu
                  </button>
                </div>

                {isWaitingForImage ? (
                  <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    Bước hiện tại: Anh/chị cần tải ảnh voucher trước khi nhập 10 ký tự đầu.
                  </div>
                ) : null}

                {voucherImage ? (
                  <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <div className="font-medium">Ảnh đã chọn</div>
                    <div className="mt-1 text-slate-600">{voucherImage.name}</div>
                  </div>
                ) : null}

                <input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  onChange={handleVoucherImageUpload}
  disabled={loading}
  className="hidden"
/>
                <div className="flex items-end gap-2">
  <button
    type="button"
    onClick={() => fileInputRef.current?.click()}
    className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm"
  >
    ⌾
  </button>

  <button
    type="button"
    onClick={() => fileInputRef.current?.click()}
    className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm"
  >
    ▣
  </button>

  <button
    type="button"
    onClick={() => fileInputRef.current?.click()}
    className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm"
  >
    +
  </button>

                  <div className="flex-1 rounded-full border border-slate-200 bg-slate-100/90 px-4 py-3 shadow-sm">
                    <input
                      value={customerInput}
                      onChange={(e) => setCustomerInput(e.target.value)}
                      placeholder={
                        isWaitingForImage
                          ? 'Vui lòng tải ảnh voucher trước...'
                          : isWaitingForToken
                            ? 'Nhập 10 ký tự đầu...'
                            : 'Nhập mã chi nhánh...'
                      }
                      disabled={loading || isWaitingForImage}
                      className="w-full bg-transparent outline-none disabled:text-slate-400"
                    />
                  </div>

                  <button
                    onClick={handleCustomerSend}
                    disabled={loading || isWaitingForImage}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm hover:opacity-90"
                  >
                   ➤
                  </button>
                </div>
              </div>
            </div>
          </main>

          <aside className="hidden">
            <div className="border-b px-4 py-4">
              <h2 className="text-lg font-bold text-slate-900">Chi tiết hệ thống</h2>
              <p className="text-sm text-slate-500">Apps Script / API đã kết nối Google Sheet</p>
            </div>

            <div className="h-[calc(100%-73px)] space-y-4 overflow-auto p-4">
              <div className="rounded-3xl border p-4">
                <div className="text-sm font-semibold text-slate-900">Luồng xử lý</div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  Chọn chi nhánh → tải ảnh voucher → nhập 10 ký tự đầu → API tra cứu Google
                  Sheet → kiểm tra trạng thái voucher → trả full mã nếu hợp lệ.
                </div>
              </div>

              <div className="rounded-3xl border p-4">
  <div className="text-sm font-semibold text-slate-900">Kết nối dữ liệu</div>
  <div className="mt-2 text-sm leading-6 text-slate-600">
    Hệ thống đang kết nối với Google Sheet để kiểm tra và phản hồi mã voucher.
  </div>
</div>

              <div className="rounded-3xl border p-4">
                <div className="text-sm font-semibold text-slate-900">Nhân viên theo dõi</div>
                <div className="mt-3 space-y-2 text-sm">
                  {EMPLOYEES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setEmployeeId(item.id)}
                      className={`w-full rounded-2xl p-3 text-left ${
                        employeeId === item.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs opacity-80">{item.role}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border p-4">
                <div className="text-sm font-semibold text-slate-900">Chi nhánh áp dụng</div>
                <div className="mt-3 space-y-2 text-sm">
                  {BRANCHES.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-slate-50 p-3">
                      <div className="font-semibold text-slate-900">
                        {item.code}. {item.name}
                      </div>
                      <div className="text-slate-600">Áp dụng tại: {item.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border p-4">
                <div className="text-sm font-semibold text-slate-900">Nhật ký giao dịch</div>
                <div className="mt-3 space-y-2 text-sm">
                  {transactions.length === 0 ? (
                    <div className="text-slate-500">Chưa có giao dịch nào.</div>
                  ) : null}

                  {transactions.map((tx) => (
                    <div key={tx.txId} className="rounded-2xl bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-slate-900">{tx.txId}</div>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                            tx.result === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {tx.result}
                        </span>
                      </div>
                      <div className="mt-1 text-slate-600">{tx.branchName}</div>
                      <div className="text-slate-600">Token: {tx.voucherToken}</div>
                      <div className="text-slate-600">Mã trả về: {tx.voucherCode || '-'}</div>
                      <div className="text-slate-600">{tx.reason}</div>
                      <div className="mt-1 text-[11px] text-slate-400">{tx.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border p-4">
                <div className="text-sm font-semibold text-slate-900">Phiên hiện tại</div>
                <div className="mt-2 space-y-1 text-sm text-slate-600">
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
  <div>Nhân viên hỗ trợ: {currentEmployee.name}</div>
  <div>Chi nhánh đã chọn: {selectedBranch?.name || 'Chưa chọn'}</div>
  <div>Trạng thái phiên: {flowState === 'awaiting_branch' ? 'Đang chờ chọn chi nhánh' : flowState === 'awaiting_image' ? 'Đang chờ tải ảnh voucher' : flowState === 'awaiting_token' ? 'Đang chờ nhập 10 ký tự đầu' : 'Đã hoàn tất'}</div>
  <div>Ảnh đã nhận: {voucherImage?.name || 'Chưa có'}</div>
</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}