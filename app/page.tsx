"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
const highlightText = (text: string) => {
  const parts = [];
  let lastIndex = 0;

  const regex =
    /\b\d{10}\b|(life4cut\.net[^\s]+)|\b(voucher|ID|Gmail|SĐT|chi nhánh)\b/gi;

  let match;

  while ((match = regex.exec(text)) !== null) {
    const start = match.index;

    // push text thường
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    const value = match[0];

    const className = /^\d{10}$/.test(value)
      ? "px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 font-semibold"
      : value.includes("life4cut.net")
        ? "text-blue-600 underline font-medium hover:text-blue-800 break-all"
        : "font-semibold text-pink-600";

    parts.push(
      <span key={`${value}-${start}`} className={className}>
        {value}
      </span>,
    );

    lastIndex = regex.lastIndex;
  }

  // push phần còn lại
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};
const RenderMessage = ({ text }: { text: string }) => {
  // 🔥 nếu có HTML → render thẳng
  // ✅ CHỈ render HTML khi có IMG hoặc SPAN cụ thể
  if (text.includes("<img") || text.includes("<span")) {
    return <div dangerouslySetInnerHTML={{ __html: text }} />;
  }
  return (
    <div className="space-y-2 text-[11px] leading-4 text-slate-700">
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;

        if (line.startsWith("👋")) {
          return (
            <div
              key={i}
              className="text-[12px] font-semibold text-slate-900 leading-4 tracking-tight"
            >
              {highlightText(line)}
            </div>
          );
        }
        if (line.startsWith("Em sẽ")) {
          return (
            <div
              key={i}
              className="text-[11px] font-semibold text-slate-500 leading-4"
            >
              {highlightText(line)}
            </div>
          );
        }
        if (line.includes("Các bước")) {
          return (
            <div
              key={i}
              className="
        flex items-center gap-2
        mt-3 mb-2
       text-[12px]
font-bold
tracking-wide
        text-pink-600
      "
            >
              <span className="text-lg">👉</span>
              <span>{line.replace("👉", "")}</span>
            </div>
          );
        }
        if (line.includes("Danh sách")) {
          return (
            <div
              key={i}
              className="
        flex items-center gap-2
        mt-4 mb-2
        text-pink-600 font-semibold text-[12px]
      "
            >
              <span>{highlightText(line)}</span>
            </div>
          );
        }

        if (/^\d/.test(line)) {
          const number = line.match(/^\d+/)?.[0];
          const content = line.replace(/^\d+[).]?/, "").trim();

          return (
            <div
              key={i}
              className="
        flex items-start gap-3
       p-2 mt-1.5
        rounded-xl
        bg-white
        border border-pink-200
        shadow-sm
        hover:shadow-md
        transition-all
      "
            >
              {/* NUMBER */}
              <div
                className="
          min-w-[20px] h-[20px]
          flex items-center justify-center
          rounded-full
          bg-gradient-to-br from-pink-500 to-rose-400
          text-white text-[12px] font-bold
        "
              >
                {number}
              </div>

              {/* TEXT */}
              <div className="text-[11px] text-slate-800 leading-4 font-medium">
                {highlightText(content)}
              </div>
            </div>
          );
        }

        if (line.includes("Cách")) {
          const content = line.replace("🔸", "").trim();

          return (
            <div
              key={i}
              className="
        flex items-start gap-3
       p-2 mt-1.5
        rounded-xl
        bg-white
        border border-pink-200
        shadow-sm
        hover:shadow-md
        transition
      "
            >
              <div
                className="
          w-7 h-7
          flex items-center justify-center
          rounded-full
          bg-pink-100
          text-pink-500
          text-[11px]
        "
              >
                •
              </div>

              <div className="text-[11px] text-slate-800 leading-4">
                {highlightText(content)}
              </div>
            </div>
          );
        }
        if (/life4cut\.net/.test(line)) {
          return (
            <a
              key={i}
              href={line}
              className="
  text-blue-600
  underline
  break-all
  font-medium
  hover:text-blue-800
"
            >
              {highlightText(line)}
            </a>
          );
        }
        if (line.includes("⚡")) {
          return (
            <div
              key={i}
              className="
        mt-3
        flex items-center gap-2
       px-2.5 py-1.5
        rounded-lg
        bg-blue-50
        border border-blue-200
        text-blue-700 text-[11px]
      "
            >
              ⚡ {line.replace("⚡", "").trim()}
            </div>
          );
        }

        if (line.includes("⚠️")) {
          return (
            <div
              key={i}
              className="
        mt-3
        p-3
        rounded-xl
        bg-orange-50
        border border-orange-300
        text-[11px]
        text-orange-700
        leading-4
      "
            >
              <span className="font-semibold">Lưu ý:</span>{" "}
              {line.replace("⚠️", "").replace("Lưu ý:", "").trim()}
            </div>
          );
        }
        if (line.includes("<img") || line.includes("<span")) {
          return <div key={i} dangerouslySetInnerHTML={{ __html: line }} />;
        }
        return <div key={i}>{highlightText(line)}</div>;
      })}
    </div>
  );
};
import { Paperclip, Camera, Gift, SendHorizonal } from "lucide-react";

const API_URL = "/api/voucher";

const EMPLOYEES = [
  { id: "E001", name: "Lan Anh", role: "Staff", branchId: "B001" },
  { id: "E002", name: "Minh Khoa", role: "Shift Leader", branchId: "B001" },
];

const BRANCHES = [
  {
    id: "1",
    name: "AEON Mall Tân Phú",
    value: "AEON Mall Tân Phú",
    aliases: ["1", "aeon tân phú", "aeon tan phu"],
  },
  {
    id: "2",
    name: "AEON Mall Bình Tân",
    value: "AEON Mall Bình Tân",
    aliases: ["2", "aeon bình tân", "aeon binh tan"],
  },
  {
    id: "3",
    name: "AEON Mall Bình Dương",
    value: "AEON Mall Bình Dương",
    aliases: ["3", "aeon bình dương", "aeon binh duong"],
  },
  {
    id: "4",
    name: "SORA gardens SC Bình Dương",
    value: "SORA gardens SC Bình Dương",
    aliases: ["4", "sora", "sora bình dương"],
  },
  {
    id: "5",
    name: "LOTTE Mart Vũng Tàu",
    value: "LOTTE Mart Vũng Tàu",
    aliases: ["5", "lotte vũng tàu", "lotte vung tau"],
  },
  {
    id: "6",
    name: "Aeon Tân An - Tây Ninh",
    value: "Aeon Tân An - Tây Ninh",
    aliases: ["6", "aeon tây ninh", "aeon tay ninh"],
  },
  {
    id: "7",
    name: "SC Vivo City - Q7",
    value: "SC Vivo City - Q7",
    aliases: ["7", "vivo city", "q7"],
  },
  {
    id: "8",
    name: "Thiso Mall Sala",
    value: "Thiso Mall Sala",
    aliases: ["8", "thiso", "sala"],
  },
  {
    id: "9",
    name: "Gigamall Thủ Đức",
    value: "Gigamall Thủ Đức",
    aliases: ["9", "gigamall", "thủ đức"],
  },
  {
    id: "10",
    name: "LOTTE Mart Cần Thơ",
    value: "LOTTE Mart Cần Thơ",
    aliases: ["10", "lotte cần thơ", "can tho"],
  },
  {
    id: "11",
    name: "Central Market Lê Lai - Q1",
    value: "Central Market Lê Lai - Q1",
    aliases: ["11", "lê lai", "q1"],
  },
  {
    id: "12",
    name: "TTTM Now Zone - Q1",
    value: "TTTM Now Zone - Q1",
    aliases: ["12", "now zone", "q1"],
  },
  {
    id: "13",
    name: "Tầng 4 - Vincom Thủ Đức",
    value: "Tầng 4 - Vincom Thủ Đức",
    aliases: ["13", "vincom thủ đức"],
  },
  {
    id: "14",
    name: "Tầng 6 - Vạn Hạnh Mall",
    value: "Tầng 6 - Vạn Hạnh Mall",
    aliases: ["14", "vạn hạnh", "van hanh"],
  },
];

const CONVERSATIONS = [
  {
    id: "C001",
    name: "Khách nhận voucher",
    subtitle: "Chat bot xác thực voucher",
    online: true,
  },
  {
    id: "C002",
    name: "Lịch sử tra cứu",
    subtitle: "Giao dịch gần đây",
    online: false,
  },
  {
    id: "C003",
    name: "Cảnh báo",
    subtitle: "Theo dõi bất thường",
    online: false,
  },
];

type ChatRole = "bot" | "customer" | "system";
type ChatItem = {
  role: ChatRole;
  text: string;
  time: string;
  type?: "normal" | "success"; // 👈 THÊM DÒNG NÀY
  variant?: "title" | "section" | "note"; // ✅ thêm dòng này
  isTyping?: boolean;
  voucherCode?: string;
};

type Branch = {
  id: string;
  name: string;
  value: string;
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
  status?: "UNUSED" | "USED" | "EXPIRED";
  branch_scope?: string;
};

type TransactionItem = {
  txId: string;
  branchName: string;
  branchScope: string;
  voucherToken: string;
  voucherCode: string;
  result: "approved" | "rejected";
  reason: string;
  time: string;
};
// Khai báo quy trình
type FlowState =
  | "awaiting_employee"
  | "awaiting_name"
  | "awaiting_phone"
  | "awaiting_branch"
  | "awaiting_image"
  | "awaiting_life4cut" // ✅ THÊM DÒNG NÀY
  | "awaiting_token"
  | "awaiting_email"
  | "done";

// Đoạn mở đầu trên khung chat
const INITIAL_CHAT: Omit<ChatItem, "time">[] = [
  {
    role: "bot",
    text: `👋 Xin chào anh/chị. Em là Seri – trợ lý hỗ trợ nhận voucher từ Life4Cut.
Em sẽ hướng dẫn anh/chị từng bước để hoàn tất quy trình một cách nhanh chóng và chính xác.
👉 Các bước thực hiện:

1 Nhập thông tin cá nhân bao gồm: (Họ và Tên + SDT)
2️ Nhập tên chi nhánh áp dụng (đúng cú pháp có sẵn)
3️ Upload hình ảnh của phiếu voucher 
4️ Quét mã QR ở góc trái phía dưới ảnh, sau đó sao chép link upload đầy đủ có dạng:
(download.life4cut.net/QRimage/20260330/1066/xxxxx)
5️ Nhập mã ID có 10 số được in trên phiếu Voucher

 ⚠️ Lưu ý: Anh/chị vui lòng nhập chính xác tất cả thông tin để hệ thống ghi nhận, tích điểm và giữ quyền lợi cho mình đầy đủ nha ạ!`,
  },
  {
    role: "bot",
    text: "👋 Em chào anh/chị ạ 💛\n🔐 Mình vui lòng nhập mã nhân viên hỗ trợ.",
  },
  // {
  //   role: "bot",
  //   text: `Tiếp theo mình sẽ bắt đầu bằng việc nhập thông tin Họ Và tên nhé!`,
  // },
];

function formatChatTime() {
  return new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime() {
  return new Date().toLocaleString("vi-VN");
}

function normalizeText(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeToken(value: string) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function resolveBranch(input: string) {
  const normalized = normalizeText(input);

  return (
    BRANCHES.find(
      (b) =>
        normalizeText(b.value) === normalized || b.aliases.includes(normalized),
    ) || null
  );
}
function buildTxId(sequence: number) {
  const now = new Date();
  return `TX${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}${String(sequence).padStart(4, "0")}`;
}

async function requestVoucherFromSheet(payload: {
  customer_name: string;
  customer_phone: string;
  branch_scope: string;
  image_ref: string;
  voucher_token: string;
  customer_email?: string;
  life4cut_link?: string;
  employee_id?: string; // ✅ THÊM
}) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  try {
    return JSON.parse(text) as VoucherApiResponse;
  } catch {
    return {
      ok: false,
      message: text || "Không đọc được phản hồi từ hệ thống.",
    } satisfies VoucherApiResponse;
  }
}
export default function VoucherChatbotMVP() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeConversationId, setActiveConversationId] = useState("C001");
  // const [chat, setChat] = useState<ChatItem[]>(
  //   INITIAL_CHAT.map((item) => ({ ...item, time: formatChatTime() })),
  // );
  const [chat, setChat] = useState<ChatItem[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [customerInput, setCustomerInput] = useState("");
  const [showBranches, setShowBranches] = useState(false);
  const [flowState, setFlowState] = useState<FlowState>("awaiting_employee");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [voucherImage, setVoucherImage] = useState<string>("");
  const [life4CutLink, setLife4CutLink] = useState<string>("");
  const [savedLife4CutLink, setSavedLife4CutLink] = useState<string>(""); // 🔥 THÊM
  const [savedVoucher, setSavedVoucher] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  useEffect(() => {
    console.log("📧 EMAIL FINAL:", customerEmail);
  }, [customerEmail]);
  useEffect(() => {
    console.log("Life4Cut:", life4CutLink);
  }, [life4CutLink]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const runIntro = async () => {
      for (const item of INITIAL_CHAT) {
        await typeMessage(item.text);
        await new Promise((res) => setTimeout(res, 300));
      }

      // 👉 set đúng flow sau intro
      setFlowState("awaiting_employee");
    };

    runIntro();
  }, []);
  useEffect(() => {
    console.log("🔥 selectedBranch STATE:", selectedBranch);
  }, [selectedBranch]);
  // Block này dùng để khai báo chức năng upload link ảnh chụp Life4cut
  const getDateFromLink = (link: string) => {
    const match = link.match(/date=(\d+)/);
    if (!match) return null;
    return new Date(Number(match[1]));
  };
  const isWithinDays = (date: Date, maxDays: number) => {
    const today = new Date();
    const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= maxDays;
  };
  const isValidLife4Cut = (link: string) => {
    if (
      !link.includes("life4cut.net") ||
      !link.includes("/webQr") ||
      !link.includes("bucket=") ||
      !link.includes("folderPath=") ||
      !link.includes("")
    ) {
      return false;
    }
    const dateObj = getDateFromLink(link);
    if (!dateObj) return false;
    return isWithinDays(dateObj, 2);
  };
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const currentEmployee = useMemo<Employee>(() => {
    return EMPLOYEES.find((item) => item.id === employeeId) || EMPLOYEES[0];
  }, [employeeId]);
  const isWaitingForImage = flowState === "awaiting_image";
  const isWaitingForToken = flowState === "awaiting_token";
  const appendChat = (
    role: "bot" | "customer",
    text: string,
    isTyping: boolean = false,
  ) => {
    setChat((prev) => [
      ...prev,
      {
        role,
        text,
        isTyping,
        time: formatChatTime(),
      },
    ]);
  };
  const typeMessage = async (text: string) => {
    setIsBotTyping(true); // 🔒 LOCK
    // ✅ FIX: nếu có HTML thì render luôn
    if (text.includes("<img") || text.includes("<span")) {
      appendChat("bot", text, false);
      setIsBotTyping(false);
      return;
    }

    // 1. Hiện typing (...)
    appendChat("bot", "", true);

    await new Promise((res) => setTimeout(res, 60));

    // 2. Xoá typing
    setChat((prev) => prev.slice(0, -1));

    // 3. Tạo message rỗng
    appendChat("bot", "", false);

    let currentText = "";

    for (let i = 0; i < text.length; i++) {
      currentText += text[i];

      setChat((prev) => {
        const newChat = [...prev];

        // ⚠️ luôn update message cuối cùng
        const lastIndex = newChat.length - 1;

        newChat[lastIndex] = {
          ...newChat[lastIndex],
          text: currentText,
        };

        return newChat;
      });

      await new Promise((res) => setTimeout(res, 15));
    }
    setIsBotTyping(false); // 🔓 UNLOCK
  };
  const resetAll = () => {
    setChat([]);

    setTimeout(async () => {
      for (const item of INITIAL_CHAT) {
        await typeMessage(item.text);
      }
    }, 200);
    setTransactions([]);
    setLoading(false);
    setCustomerInput("");
    setFlowState("awaiting_employee");
    setSelectedBranch(null);
    setVoucherImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const runVoucherRequest = async ({
    branch,
    image,
    token,
    email,
    employee_id,
  }: {
    branch: string;
    image: string;
    token: string;
    email?: string;
    employee_id?: string;
  }) => {
    if (!branch) {
      const message =
        "Anh/chị vui lòng chọn chi nhánh áp dụng trước khi tiếp tục.";
      await typeMessage(message);
      return { ok: false, message };
    }
    try {
      console.log("DEBUG:", customerName, customerPhone);
      const apiResult = await requestVoucherFromSheet({
        customer_name: customerName, // 🔥 sửa ở đây
        customer_phone: customerPhone, // 🔥 sửa ở đây
        branch_scope: branch,
        image_ref: image,
        voucher_token: token,
        customer_email: email,
        life4cut_link: savedLife4CutLink,
        employee_id: employee_id, // ✅ THÊM CHÍNH XÁC Ở ĐÂY
      });
      const transaction: TransactionItem = {
        txId: apiResult.tx_id || buildTxId(transactions.length + 1),
        branchName: branch,
        branchScope: branch,
        voucherToken: token,
        voucherCode: apiResult.voucher_code || "",
        result: apiResult.ok ? "approved" : "rejected",
        reason: apiResult.message || "",
        time: formatDateTime(),
      };
      setTransactions((prev) => [transaction, ...prev]);
      if (apiResult.ok && apiResult.voucher_code) {
        return { ok: true, voucherCode: apiResult.voucher_code };
      }
      const message =
        apiResult.message ||
        "Hiện hệ thống chưa thể cấp mã voucher. Anh/chị vui lòng thử lại sau.";
      await typeMessage(message);
      // setResult({ ok: false, message });
      return { ok: false, message };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Lỗi kết nối hệ thống.";
      await typeMessage(message);
      // setResult({ ok: false, message });
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  };
  // Đoạn này setup những bước của bot yêu cầu nếu không có nó BO
  const handleCustomerSend = async () => {
    if (flowState === "done") return;
    const rawMessage = customerInput.trim();
    if (flowState === "awaiting_employee") {
      const emp = rawMessage.trim();
      appendChat("customer", emp);

      if (!emp) {
        await typeMessage("❌ Vui lòng nhập mã nhân viên!");
        return;
      }

      setCustomerInput("");
      setLoading(true);

      try {
        const res = await requestVoucherFromSheet({
          customer_name: "test",
          customer_phone: "0000000000",
          branch_scope: "test",
          image_ref: "",
          voucher_token: "TESTTOKEN",
          employee_id: emp,
        });

        setLoading(false);

        if (!res.ok && res.message?.includes("nhân viên")) {
          await typeMessage(
            "❌ Mã nhân viên không tồn tại, vui lòng nhập lại!",
          );
          return;
        }

        setEmployeeId(emp);

        await typeMessage("✅ Đã nhận mã nhận viên");
        await typeMessage("👤 Anh/chị ơi, vui lòng cho em xin TÊN mình nhé");

        setFlowState("awaiting_name");
      } catch {
        setLoading(false);
        await typeMessage("⚠️ Lỗi hệ thống!");
      }

      return;
    }
    // 🚀 XỬ LÝ EMAIL (PHẢI CÓ)
    if (flowState === "awaiting_email") {
      const email = rawMessage;
      appendChat("customer", email);
      setCustomerInput(""); // 🔥 THÊM DÒNG NÀY
      if (!email.includes("@")) {
        await typeMessage("❌ Email chưa đúng định dạng!");
        return;
      }
      setCustomerEmail(email);
      await runVoucherRequest({
        branch: selectedBranch?.value || "",
        image: voucherImage || "",
        token: savedVoucher.slice(0, 10), // ⚠️ QUAN TRỌNG
        email: email, // ✅ PHẢI LÀ email (KHÔNG phải customerEmail)
        employee_id: employeeId, // ✅ THÊM DÒNG NÀY
      });

      await typeMessage("📨 Đang gửi mã về Gmail...");
      const res = await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          voucherCode: savedVoucher,
          life4CutLink: savedLife4CutLink,
        }),
      });
      const data = await res.json();

      if (!data.ok) {
        await typeMessage("❌ Gửi mail thất bại!");
        return;
      }

      await typeMessage(
        "🎉 Hoàn tất! Mã voucher đã được gửi về Gmail của anh/chị 💌",
      );

      await typeMessage(
        "🙏 Cảm ơn anh/chị đã sử dụng dịch vụ Life4Cuts 💛\n✨ Hẹn gặp lại anh/chị lần sau!",
      );

      await typeMessage(
        "✨ Nếu cần hỗ trợ thêm, anh/chị có thể bắt đầu lại bất cứ lúc nào nhé!",
      );

      setFlowState("done");
      return;
    }
    if (!rawMessage || loading || isBotTyping) return;
    appendChat("customer", rawMessage);
    setCustomerInput("");
    if (flowState === "awaiting_name") {
      if (!rawMessage.trim()) {
        await typeMessage(
          "👉 Anh/chị ơi, mình nhập đúng Họ và Tên giúp em nhé 💛 để hệ thống tích điểm và giữ quyền lợi cho mình được đầy đủ nha!",
        );
        return;
      }
      setCustomerName(rawMessage.trim());
      await typeMessage(
        "☎ Vui lòng cung cấp số điện thoại (10 chữ số) để tiếp tục.",
      );

      setFlowState("awaiting_phone");
      return;
    }

    if (flowState === "awaiting_phone") {
      if (!/^\d{10}$/.test(rawMessage.trim())) {
        await typeMessage(
          "❌ Hình như SĐT chưa đúng rồi ạ 🥺 Anh/chị nhập lại đủ 10 số giúp em nhé!",
        );
        return;
      }

      setCustomerPhone(rawMessage.trim());
      await typeMessage(
        `👉 Anh/chị vui lòng chọn chi nhánh bằng một trong các cách sau:
🔸 Cách 1: Nhập số
🔸 Cách 2: Nhập tên chi nhánh  
🔸 Cách 3: Chọn nhanh bên dưới 

📍Danh sách các chi nhánh:\n\n` +
          BRANCHES.map((b) => `${b.id}. ${b.name}`).join("\n") +
          `\n\n⚡ Nhập số hoặc tên chi nhánh để tiếp tục.`,
      );

      setFlowState("awaiting_branch");
      return;
    }

    if (flowState === "awaiting_branch") {
      const branch = resolveBranch(rawMessage);
      if (!branch) {
        await typeMessage(
          "👉 Dạ Xin vui lòng nhập lại/chọn lại thông tin chi nhánh đúng đủ hơn ạ",
        );
        await typeMessage(
          "⚠️ Xin Lưu ý: Nhập đúng cú pháp để hệ thống nhận diện nhé ạ!",
        );

        return;
      }

      setSelectedBranch(branch);
      setFlowState("awaiting_image");
      await typeMessage(
        `🎉 Đã chọn thành công!\n🏬 ${branch.name}\n\n👉 Tiếp tục bước tiếp theo nhé.`,
      );
      await typeMessage(
        `Bước 2: 👉 Anh/chị tải giúp em hình ảnh voucher ở bên dưới nhé!`,
      );
      return;
    }
    if (flowState === "awaiting_life4cut") {
      await typeMessage("👉 Vui lòng bấm nút 🔗 để nhập link Life4Cut!");
      return;
    }

    if (flowState === "awaiting_token") {
      const normalizedToken = normalizeToken(rawMessage);
      if (normalizedToken.length !== 10) {
        await typeMessage(
          "❌ Hình như mã ID chưa đúng rồi ạ 🥺 Anh/chị nhập lại đủ 10 ký tự giúp em nhé!",
        );
        return;
      }
      await typeMessage(`ID_RECEIVED:\n${normalizedToken}`);
      await typeMessage(`💛 Mình Đợi em kiểm tra một chút xíu nhé!`);
      setLoading(true);
      await new Promise((res) => setTimeout(res, 500));
      if (!employeeId) {
        await typeMessage("❌ Thiếu mã nhân viên, vui lòng nhập lại!");
        setFlowState("awaiting_employee");
        return;
      }

      const response = await runVoucherRequest({
        branch: selectedBranch?.value || "",
        image: voucherImage || "",
        token: normalizedToken,
        email: "", // ✅ THÊM DÒNG NÀY
        employee_id: employeeId, // ✅ THÊM DÒNG NÀY
      });
      setLoading(false);

      // 👉 THÊM DÒNG NÀY (QUAN TRỌNG)
      if (!response.voucherCode) {
        await typeMessage("❌ Không lấy được mã voucher, vui lòng thử lại!");
        return;
      }

      const fullCode = response.voucherCode;
      setSavedVoucher(fullCode);
      // 👉 SAU ĐÓ mới dùng
      const hiddenCode = fullCode.slice(0, -4) + "xxxx";

      // 1. Yay
      await typeMessage(
        "🎉 Yay! Anh/chị đã xác nhận voucher thành công rồi ạ 💛",
      );

      // 2. Hiển thị code ẩn
      await typeMessage(`🎁 Mã voucher của bạn là:\n${hiddenCode}`);

      // 3. Hỏi email
      await typeMessage(
        "📧 Anh/chị vui lòng nhập Gmail để nhận mã đầy đủ nhé ạ 💌",
      );

      // 4. chuyển flow
      setFlowState("awaiting_email");

      return;
    }
    await typeMessage(
      "✅ Mình đã hoàn tất rồi ạ 💛 Anh/chị bấm “Mới” để bắt đầu lại nhé!.",
    );
  };

  //const handleVoucherImageUpload
  const handleVoucherImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || loading) return;
    appendChat("customer", `Đã tải ảnh voucher: ${file.name}`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await uploadRes.json();
      const url = data.url;
      console.log("Ảnh Cloudinary:", url);
      setVoucherImage(url);
    } catch (err) {
      console.error("Upload lỗi:", err);
    }
    setFlowState("awaiting_life4cut");
    await typeMessage(
      `👉 Bước 3: Anh/chị bấm vào nút <span style="display:inline-flex;
      align-items:center;
      justify-content:center;width:22px;height:22px;
      border-radius:50%;background:white;border:2px solid #FF4D8D;box-shadow:0 8px 20px rgba(255,77,141,0.3);margin:0 10px;"><img src="/images/paperclip.png" style="width:20px;height:20px;" /></span> bên dưới để nhập link ảnh Life4Cut hôm nay giúp em nhé 💛`,
    );
  };
  const handleLife4CutUpload = async () => {
    const link = prompt("Nhập link Life4Cut:");
    if (!link) return;
    if (!isValidLife4Cut(link)) {
      await typeMessage(
        "❌ Hình như link https://download.life4cut.net/webQr chưa đúng hoặc không phải ảnh hôm nay rồi ạ 🥺 Anh/chị kiểm tra lại và copy đầy đủ một đoạn dài giúp em nhé!",
      );
      return;
    }
    // 👉 lưu link
    setLife4CutLink(link);
    setSavedLife4CutLink(link); // 🔥 THÊM DÒNG NÀY
    console.log("SET LINK:", link); // 🔥 THÊM
    // 👉 hiển thị chat
    await typeMessage(
      "✅ Em đã nhận được link Life4Cut của anh/chị rồi ạ 💛 Đợi em kiểm tra một chút nhé!",
    );
    await typeMessage("🥰 dạ link Life4Cut của mình hợp lệ nha 💛");
    await typeMessage(
      " 👉 Bước 4: 🔑 Vui lòng nhập mã ID (10 ký tự) được in trên voucher.",
    );
    // 👉 chuyển bước
    setFlowState("awaiting_token");
  };
  return (
    <div className="h-dvh bg-slate-100 p-2 md:p-3">
      <div className="mx-auto h-full max-w-[380px] overflow-hidden rounded-[29px] border border-slate-800 bg-white shadow-smsoft-card">
        <div className="grid h-full grid-cols-12">
          <aside className="hidden">
            <div className="border-b-2 border-pink-200 px-4 py-4 bg-gradient-to-r from-pink-50 to-pink-100 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Life4Cuts Voucher Bot
                  </h1>
                  <p className="text-[11px] text-slate-500">
                    Tra voucher từ Google Sheet
                  </p>
                </div>
                <button
                  onClick={resetAll}
                  className="rounded-full border px-4 py-2 text-[11px] hover:bg-slate-50"
                >
                  Mới
                </button>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-100 px-2.5 py-1.5 text-[11px] text-slate-500">
                Luồng: Chọn chi nhánh → Tải ảnh voucher → Nhập 10 ký tự đầu →
                Trả full mã
              </div>
            </div>

            <div className="h-[calc(100%-113px)] overflow-auto p-2">
              {CONVERSATIONS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveConversationId(item.id)}
                  className={`mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                    activeConversationId === item.id
                      ? "bg-slate-100"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                    {item.name.slice(0, 2).toUpperCase()}
                    {item.online ? (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-slate-900">
                      {item.name}
                    </div>
                    <div className="truncate text-[11px] text-slate-500">
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <main className="col-span-12 flex min-h-0 h-full overflow-hidden flex-col">
            <div className="flex items-center w-full px-4 py-3 bg-[#F6E6EA] border-b border-white/30 shadow-sm gap-[20px]">
              <div className="flex items-center whitespace-nowrap gap-2 flex-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                  ✨
                </div>

                <div>
                  <div className="text-[12px] font-semibold text-gray-900">
                    Life4Cuts Voucher
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">
                    Phản hồi tự động
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-2 text-green-700 text-[11px] font-medium shrink-0">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span>Đang hoạt động</span>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-0 pb-2">
              <div className="flex w-full flex-col gap-4 pb-3">
                {/* VOUCHER */}
                <div className="flex flex-col mb-4">
                  <div className="flex flex-col gap-3 items-start">
                    <div className="h-11 w-12 rounded-full bg-gray-200 text-white flex items-center justify-center text-xs">
                      <Gift size={28} className="text-pink-500" />
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm max-w-full sm:max-w-[420px] w-full overflow-visible">
                      <p className="text-xs font-semibold text-slate-500 mb-2">
                        🎁 Hình mẫu phiếu voucher
                      </p>

                      <div className="mx-auto w-full max-w-5xl overflow-visible ...">
                        <img
                          src="/images/voucher.jpg"
                          className="w-full h-auto object-contain max-w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {chat.map((msg, idx) => (
                  <div
                    key={`${msg.role}-${idx}`}
                    className={`flex w-full ${
                      msg.role === "customer" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* 👇 AVATAR BOT */}
                    {msg.role === "bot" && (
                      <img
                        src="/images/bot-avatar.png"
                        alt="bot"
                        className="w-8 h-8 mr-2 shrink-0"
                      />
                    )}

                    <div
                      className={`inline-block max-w-[60%] rounded-2xl text-[12px] leading-[1.8] ${
                        msg.role === "bot"
                          ? "rounded-2xl bg-white text-slate-800 shadow-sm border border-slate300 rounded-bl-md font-medium"
                          : msg.role === "system"
                            ? "rounded-2xl bg-slate-100 text-slate-800 border border-slate-300 rounded-bl-md"
                            : "bg-blue-200 from-purple-800 via-fuchsia-500 to-pink-500 shadow-md px-2 py-2 rounded-br-md"
                      }`}
                    >
                      {/* Đoạn này để tin nhắn có dạng list và xuống dòng được */}

                      <div
                        className={`whitespace-pre-line px-1 py-2 rounded-xl text-[11.5px] leading-[1.3]
  shadow-md border
  ${
    msg.type === "success"
      ? "bg-green-50 text-green-900 border-green-500"
      : msg.role === "bot"
        ? "bg-pink-50 text-slate-900 border-pink-300"
        : "bg-blue-50 text-slate-900 border-blue-100"
  }`}
                      >
                        {(() => {
                          if (msg.text.includes("Đã chọn thành công")) {
                            return (
                              <div className="mt-2 bg-green-100 border border-green-400 rounded-xl inline-block px-2 py-1 shadow-sm max-w-fit">
                                {/* HEADER */}
                                <div className="flex items-center gap-1 text-green-500 font-semibold text-[11px]">
                                  <span className="text-[10px]">✅</span>
                                  ĐÃ CHỌN CHI NHÁNH
                                </div>

                                {/* CONTENT */}
                                <div className="mt-1 text-[10px] text-black break-all text-center">
                                  {msg.text.split("\n")[1]?.replace("🏬 ", "")}
                                </div>
                              </div>
                            );
                          }

                          if (msg.text.includes("đã nhận được link Life4Cut")) {
                            return (
                              <div className="mt-2 bg-green-100 border border-green-400 rounded-xl px-4 py-3 shadow-sm max-w-fit">
                                {/* HEADER */}
                                <div className="flex items-center gap-2 text-green-600 font-semibold text-[10px]">
                                  <span className="text-[10px]">✅</span>
                                  ĐÃ NHẬN LINK ẢNH LIFE4CUTS
                                </div>
                              </div>
                            );
                          }
                          if (msg.text.startsWith("ID_RECEIVED:")) {
                            const code = <RenderMessage text={msg.text} />;
                            return (
                              <div className="mt-2 bg-green-100 border border-green-400 rounded-xl px-4 py-3 shadow-sm max-w-fit">
                                {/* HEADER */}
                                <div className="flex flex-col gap-1 text-green-900 font-semibold text-[11px]">
                                  <div className="text-[12px] font-semibold text-green-800">
                                    <span>✅</span>
                                    ĐÃ NHẬN MÃ ID
                                  </div>
                                  <div
                                    className="mt-2 
                text-[12px] 
                font-bold 
                text-[#e11d48] 
                underline 
                decoration-2 
                decoration-[#e11d48]
                underline-offset-4 
                tracking-widest 
                bg-yellow-200 
                px-6 py-2 
                rounded-md 
                inline-block
                shadow-[0_10px_25px_rgba(0,0,0,0.25)]
                transition-all duration-300
                hover:scale-105"
                                  >
                                    {code}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          if (msg.isTyping) {
                            return (
                              <div className="flex gap-1 px-2 py-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                              </div>
                            );
                          }
                          if (msg.text.includes("Đang gửi mã về Gmail")) {
                            return (
                              <div className="mt-2 bg-green-100 border border-green-400 rounded-xl px-4 py-3 shadow-sm max-w-fit">
                                <div className="flex items-center gap-2 text-green-700 font-semibold text-[11px]">
                                  <span>📩</span>
                                  Đã nhận Gmail
                                </div>
                              </div>
                            );
                          }

                          if (msg.text.includes("Mã voucher")) {
                            const code = <RenderMessage text={msg.text} />;
                            return (
                              <div className="mt-2 bg-green-100 border border-green-400 rounded-xl PX-4 py-2 shadow-sm inline-block">
                                <div className="text-[12px] font-semibold text-green-800">
                                  ✅ XÁC NHẬN THÀNH CÔNG
                                </div>
                                <div
                                  className="mt-2 
                text-[12px] 
                font-bold 
                text-[#e11d48] 
                underline 
                decoration-2 
                decoration-[#e11d48]
                underline-offset-4 
                tracking-widest 
                bg-yellow-200 
                px-2 py-1 
                rounded-md 
                inline-block
                shadow-[0_10px_25px_rgba(0,0,0,0.25)]
                transition-all duration-300
                hover:scale-105"
                                >
                                  {code}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <>
                              <RenderMessage text={msg.text} />

                              {/* ✅ CHECK ICON USER */}
                              {msg.role === "customer" && (
                                <div className="text-[12px] text-gray-500 text-right mt-0">
                                  ✔
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      <div className="mt-1 text-[10px] text-slate-500 font-semibold tracking-wide">
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
                {flowState === "done" && (
                  <div className="sticky bottom-24 flex justify-center z-30">
                    <button
                      onClick={resetAll}
                      className="
                      fixed bottom-20 z-50
  px-2 py-1 rounded-full
  bg-white
  !text-red-600 font-semibold
  text-[14px]
  border border-red-300
  shadow-[0_8px_25px_rgba(239,68,68,0.25)]
  hover:bg-red-50 hover:scale-105
  active:scale-95
  transition-all duration-300
"
                    >
                      🔁 BẮT ĐẦU LẠI
                    </button>
                  </div>
                )}
                {loading && (
                  <div className="flex justify-start mt-2">
                    <div className="bg-pink-100 border border-pink-300 rounded-2xl px-2 py-1 shadow-sm flex items-center gap-2">
                      <span className="text-[10px] text-slate-700 font-medium">
                        ⏳ Xin vui lòng chờ trong giây lát
                      </span>

                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div
              className="
shrink-0
bg-white/50 backdrop-blur-2xl
border-t border-white/40
px-5 py-3
shadow-[0_-15px_60px_rgba(255,77,141,0.25)]
rounded-t-3xl
"
            >
              <div className="mx-auto w-full max-w-[380px] relative">
                <div className="flex justify-center mb-2">
                  <button
                    onClick={() => setShowBranches((prev) => !prev)}
                    className="
fixed bottom-20 right-4 z-[999]
flex h-7 w-7 items-center justify-center
rounded-full
bg-white
text-pink-600
border-2 border-pink-500
shadow-[0_4px_10px_rgba(236,72,153,0.15)]
hover:bg-pink-50
transition-all duration-200
"
                  >
                    <span className="text-[18px] text-pink-500 leading-none">
                      {showBranches ? "▲" : "▼"}
                    </span>
                  </button>
                </div>
                {showBranches && (
                  <>
                    {/* Blur background */}
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30" />

                    {/* Bottom sheet */}
                    <div
                      className="
        fixed bottom-0 left-0 right-0 z-40
        bg-white/80 backdrop-blur-2xl
        rounded-t-3xl
        border-t border-white/40
        shadow-[0_-20px_60px_rgba(0,0,0,0.25)]
        px-4 pt-4 pb-6
        animate-slideUp
      "
                    >
                      {/* Handle */}
                      <div className="flex justify-center mb-1">
                        <div className="w-10 h-1 bg-slate-300 rounded-full" />
                      </div>

                      {/* Title */}
                      <div className="text-center text-[12px] font-semibold text-slate-600 mb-3">
                        Chọn chi nhánh
                      </div>

                      {/* LIST */}
                      <div className="flex flex-wrap gap-1 max-h-[220px] overflow-y-auto">
                        {BRANCHES.map((branch) => {
                          const isActive = selectedBranch?.id === branch.id;
                          return (
                            <button
                              key={branch.id}
                              onClick={() => {
                                if (flowState === "done") return;
                                setCustomerInput(branch.value);
                                setSelectedBranch(branch);
                                setShowBranches(false);

                                if (flowState === "awaiting_branch") {
                                  handleCustomerSend();
                                }
                              }}
                              className={`
                px-4 py-2 rounded-full text-[11px] font-medium
                transition-all
                ${
                  isActive
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-pink-50"
                }
              `}
                            >
                              {branch.id}. {branch.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
                {isWaitingForImage && !voucherImage && (
                  <div className="mb-3 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-700 shadow-sm">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <div className="font-medium">Chưa có ảnh voucher</div>
                      <div className="text-amber-600">
                        Vui lòng tải lên ảnh phiếu voucher để tiếp tục.
                      </div>
                    </div>
                  </div>
                )}
                {voucherImage && (
                  <div className="mb-3 flex items-start gap-1 rounded-2xl border border-emerald-200 bg-emerald-50 px-1 py-0 text-[11px] text-emerald-700 shadow-sm">
                    <span className="text-[15px]">✅</span>
                    <div className="w-full">
                      <div className="font-medium">ĐÃ TẢI ẢNH VOUCHER</div>

                      <a
                        href={voucherImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block truncate text-emerald-600 underline hover:text-emerald-800"
                      >
                        {voucherImage}
                      </a>
                    </div>
                  </div>
                )}
                {/* Đoạn này dùng để kiểm tra check gửi uploa hình ảnh có được duyệt hay không  */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleVoucherImageUpload}
                  disabled={loading}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  {flowState !== "done" && (
                    <div className="flex items-center gap-3"></div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (flowState === "done") return;
                      fileInputRef.current?.click();
                    }}
                    className="
flex h-7 w-8 items-center justify-center
rounded-full
bg-white 
text-pink-900
shadow-[0_10px_25px_rgba(236,72,153,0.3)]
border-2 border-[#FF3B7A]
hover:scale-110 transition
"
                  >
                    <Camera
                      size={18}
                      strokeWidth={3}
                      className="text-[#FF4D8D]"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (flowState === "awaiting_life4cut") {
                        handleLife4CutUpload(); // 👉 nhập link
                      } else {
                        fileInputRef.current?.click();
                      }
                    }} // 👉 vẫn upload ảnh bình thường
                    className="
flex h-7 w-8 items-center justify-center
rounded-full
bg-white 
text-pink-900
shadow-[0_10px_25px_rgba(236,72,153,0.3)]
border-2 border-[#FF3B7A]
hover:scale-110 transition
"
                  >
                    {" "}
                    <Paperclip
                      size={18}
                      strokeWidth={3}
                      className="text-[#FF4D8D]"
                    />
                  </button>

                  <div
                    className="
 flex-2
rounded-full
bg-white
px-3 py-1
border border-pink-500
shadow-[0_2px_6px_rgba(236,72,153,0.2)]"
                  >
                    <input
                      value={customerInput}
                      onChange={(e) => setCustomerInput(e.target.value)}
                      disabled={
                        loading ||
                        isWaitingForImage ||
                        isBotTyping ||
                        flowState === "done"
                      }
                      // 🔥 THÊM ĐOẠN NÀY click Enter thì sẽ tự nhập nội dung ( 691 - 697)
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCustomerSend();
                        }
                      }}
                      placeholder={
                        isWaitingForImage
                          ? "Vui lòng tải ảnh..." // Chỉnh sữa khung chat
                          : isWaitingForToken
                            ? "Nhập thông tin tại đây..."
                            : ""
                      }
                      className="w-full bg-transparent outline-none disabled:text-slate-400"
                    />
                  </div>

                  <button
                    onClick={handleCustomerSend}
                    disabled={
                      loading ||
                      isWaitingForImage ||
                      isBotTyping ||
                      flowState === "done"
                    }
                    className="
flex h-7 w-8 items-center justify-center
rounded-full
bg-white 
text-pink-900
shadow-[0_10px_25px_rgba(236,72,153,0.3)]
border-2 border-[#FF3B7A]
hover:scale-110 transition
"
                  >
                    <SendHorizonal
                      size={18}
                      strokeWidth={3}
                      className="text-[#FF4D8D]"
                    />
                  </button>
                </div>
              </div>
            </div>
          </main>

          <aside className="hidden">
            <div className="border-b px-4 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                Chi tiết hệ thống
              </h2>
              <p className="text-[11px] text-slate-500">
                Apps Script / API đã kết nối Google Sheet
              </p>
            </div>

            <div className="h-[calc(100%-73px)] space-y-4 overflow-auto p-4">
              <div className="rounded-3xl border p-4">
                <div className="text-[11px] font-semibold text-slate-900">
                  Luồng xử lý
                </div>
                <div className="mt-2 text-[11px]leading-5 text-slate-600">
                  Chọn chi nhánh → tải ảnh voucher → nhập 10 ký tự đầu → API tra
                  cứu Google Sheet → kiểm tra trạng thái voucher → trả full mã
                  nếu hợp lệ.
                </div>
              </div>

              <div className="rounded-3xl border p-4">
                <div className="text-[11px] font-semibold text-slate-900">
                  Kết nối dữ liệu
                </div>
                <div className="mt-2 text-[11px] leading-5 text-slate-600">
                  Hệ thống đang kết nối với Google Sheet để kiểm tra và phản hồi
                  mã voucher.
                </div>
              </div>

              <div className="rounded-3xl border p-4">
                <div className="text-[11px] font-semibold text-slate-900">
                  Nhân viên theo dõi
                </div>
                <div className="mt-3 space-y-2 text-[11px]">
                  {EMPLOYEES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setEmployeeId(item.id)}
                      className={`w-full rounded-2xl p-3 text-left ${
                        employeeId === item.id
                          ? "bg-slate-900 text-white"
                          : "bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs opacity-80">{item.role}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border p-4">
                <div className="text-[11px] font-semibold text-slate-900">
                  Chi nhánh áp dụng
                </div>
                <div className="mt-3 space-y-2 text-[11px]">
                  {BRANCHES.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-slate-50 p-3">
                      <div className="font-semibold text-slate-900">
                        {item.id}. {item.name}
                      </div>
                      <div className="text-slate-600">
                        Áp dụng tại: {item.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border p-4">
                <div className="text-[11px] font-semibold text-slate-900">
                  Nhật ký giao dịch
                </div>
                <div className="mt-3 space-y-2 text-[11px]">
                  {transactions.length === 0 ? (
                    <div className="text-slate-500">Chưa có giao dịch nào.</div>
                  ) : null}

                  {transactions.map((tx) => (
                    <div key={tx.txId} className="rounded-2xl bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-slate-900">
                          {tx.txId}
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                            tx.result === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {tx.result}
                        </span>
                      </div>
                      <div className="mt-1 text-slate-600">{tx.branchName}</div>
                      <div className="text-slate-600">
                        Token: {tx.voucherToken}
                      </div>
                      <div className="text-slate-600">
                        Mã trả về: {tx.voucherCode || "-"}
                      </div>
                      <div className="text-slate-600">{tx.reason}</div>
                      <div className="mt-1 text-[6px] text-gray-400">
                        {tx.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border p-4">
                <div className="text-[11px] font-semibold text-slate-900">
                  Phiên hiện tại
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                  <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                    <div>Nhân viên hỗ trợ: {currentEmployee.name}</div>
                    <div>
                      Chi nhánh đã chọn: {selectedBranch?.name || "Chưa chọn"}
                    </div>
                    <div>
                      Trạng thái phiên:{" "}
                      {flowState === "awaiting_branch"
                        ? "Đang chờ chọn chi nhánh"
                        : flowState === "awaiting_image"
                          ? "Đang chờ tải ảnh voucher"
                          : flowState === "awaiting_token"
                            ? "Đang chờ nhập 10 ký tự đầu"
                            : "Đã hoàn tất"}
                    </div>
                    <div>Ảnh đã nhận: {voucherImage || "Chưa có"}</div>
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
