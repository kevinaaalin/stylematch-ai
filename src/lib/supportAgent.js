// Public operation guidance only. No account, payment, project or governance writes.
export const SUPPORT_VERSION = "2026-09-15-local-v1";
export const SUPPORT_TOPICS = [
  { id: "style", title: "風格測驗", route: "StyleTest", terms: ["風格測驗", "風格測試", "幾顆星", "評分", "喜好", "測驗", "測試風格"], answer: "從風格測驗開始，依每張圖片的喜好給 1～5 顆星；各風格以星數加總排名。完成後填寫姓名、Email、必填電話及必要同意項，送出結果申請。行銷同意是選填，不影響取得本次結果。", next: "先進入風格測驗逐張評分；完成後依畫面填寫聯絡資料。" },
  { id: "email", title: "沒有收到結果信", route: "StyleTest", terms: ["寄信", "信箱", "email", "郵件", "收不到", "沒收到", "寄送"], answer: "請先檢查 Email 是否正確，以及垃圾郵件匣。畫面顯示送出不一定代表郵件已送達；本機寄信需要可用的 SMTP 設定。我無法在這裡查證送達狀態，請勿反覆送出以免重複處理。", next: "請記下送出時間與畫面錯誤文字，交由網站管理者查詢寄信紀錄；不要提供密碼。" },
  { id: "pricing", title: "方案與會員資格", route: "PricingPlans", terms: ["方案", "會員", "價格", "費用", "多少錢", "pro", "team", "升級"], answer: "免費體驗用於風格測驗；單次購買提供固定範圍的提案，不包含商業工具點數。平面圖視覺化、圖片改版與環景等扣點功能需商業方案 Pro 或 Team。最新售價及資格請以方案價格頁為準。", next: "屋主可先選單次提案；設計師需要反覆生圖或進階工具時，請查看商業方案。" },
  { id: "points", title: "點數與生成失敗", route: "MyProjects", terms: ["點數", "扣點", "餘額", "重複扣", "退點"], answer: "商業生成流程會在結果完成、圖片可讀且儲存成功後扣點；失敗不應扣點，同一任務重送不應重複扣點。請到我的專案核對記錄。我不能在客服對話中退款、補點或確認實際帳務。", next: "記下任務編號、發生時間及點數變化，請管理者核對；不要直接重複付費。" },
  { id: "payment", title: "付款與結果", route: "PricingPlans", terms: ["付款", "付費", "刷卡", "退款", "收款"], answer: "選定 AI 提案方案後先進入付款頁，付款確認後再到我的專案查看結果。本機驗收付款不是實際收款。真實金流需要正式服務設定；我不能替您刷卡、退款或確認付款成功。", next: "請使用頁面正式付款入口；若僅顯示本機驗收付款，不要當成真實交易。" },
  { id: "proposal", title: "取得 AI 室內設計提案", route: "AIProposal", terms: ["提案", "需求表", "規劃", "設計方案"], answer: "從 AI 室內設計提案整理空間、風格與預算需求，再選擇服務方案。若是商業工具重新產生提案，需先確認參考圖片並補齊坪數、格局、預算及風格；資料不足時不會生成並扣點。", next: "先完成需求資料，再依畫面選擇方案；已有成果可到我的專案查看。" },
  { id: "projects", title: "查找我的專案", route: "MyProjects", terms: ["我的專案", "案件", "專案", "結果在哪", "找不到結果"], answer: "到我的專案查看設計成果與會員權限。請選擇正確專案再開啟工作工具，避免混用來源。此客服目前不讀取私人專案或辨識登入身份，無法代查個別案件進度。", next: "開啟我的專案並選擇目標專案；若找不到，請確認是否使用原本的瀏覽器與網站網址，勿先清除瀏覽器資料。" },
  { id: "image", title: "圖片生成與故障排除", route: "AIGenerate", terms: ["生圖", "生成圖片", "圖片生成", "comfyui", "圖片不見", "無法生成", "生成失敗"], answer: "商業方案可選擇專案、來源圖片、空間與設計風格後送出生成。本機 ComfyUI 及 API 必須啟動；若顯示未連線，請由本機管理者確認服務。GitHub Pages 不會自行提供 GPU 或本機 API。", next: "先檢查頁面的連線狀態與錯誤提示，再確認方案與點數；未確認失敗原因前不要重複送出。" },
  { id: "panorama", title: "360° 環景", route: "AIGenerate", terms: ["360", "環景", "全景", "四方向"], answer: "單一空間環景需要同一拍攝中心、前／右／後／左四張不同且有重疊的照片。不能重複使用同一張，也不是四張圖片切換。生成後仍需檢查接縫、門窗與上下極區是否合理。", next: "在空間與 360° 工具選擇單一空間 360°，依方向上傳四张原始照片。" },
  { id: "floor", title: "平面圖視覺化", route: "FloorPlanVisualizer", terms: ["平面圖", "鳥瞰", "遮罩", "局部修改"], answer: "商業方案可在平面圖視覺化選擇專案及已儲存的平面圖，或上傳來源。先核對尺度、相機及操作範圍，再執行鳥瞰或局部修改。生成圖是候選成果，仍需人工檢查。", next: "開啟平面圖視覺化，先選專案與來源圖，再設定這次操作。" },
  { id: "isafe", title: "前往 iSAFE 立案", route: "Cases", terms: ["isafe", "監管", "立案", "工程治理", "勾稽", "gate"], answer: "正式立案與工程監管請進入 iSAFE。StyleMatchAI 負責設計成果，不在這裡修改 Gate、付款勾稽或凍結步驟。iSAFE 依案件模式與目前步驟進行雙方確認，已凍結項目不能由客服改動。", next: "前往 iSAFE 立案入口，依案件選擇純設計、直接工程或設計加工程。" },
];

export function answerSupport(question, { pathname = "/Home", previousTopic = null } = {}) {
  const query = String(question || "").trim().toLowerCase().slice(0, 1000);
  const result = (text, topics = [], topic = null) => ({ text, topic, actions: topics.map(item => ({ title: item.title, to: `/${item.route}` })), source: `網站操作指南 ${SUPPORT_VERSION}` });
  if (/密碼|token|api.?key|金鑰|信用卡號|身分證/.test(query)) return result("請不要在對話中提供密碼、金鑰、信用卡號或身分證資料。我不會要求這些資料，也不能存取或變更帳戶憑證。");
  if (/真人|人工客服|聯絡客服|找客服|客訴/.test(query)) return result("目前尚未接通真人客服或工單服務。請記下所在頁面、發生時間、操作步驟與錯誤文字，透過您已有的網站管理者聯絡管道提供；請遮蔽個資。我沒有替您送出工單或通知任何人。");
  if (/幫我.*(付款|退款|刪除|核准|確認|解鎖)|修改.*gate|跳過.*勾稽/.test(query)) return result("我只能提供操作協助，不會替您付款、刪除資料、核准證據或解鎖治理步驟。請由具權限的人員在對應功能確認。", [SUPPORT_TOPICS.find(item => item.id === "isafe")]);
  let topic;
  if (/^(下一步|然後呢|接下來|怎麼開始|怎麼操作)[？?。!！\s]*$/.test(query)) topic = SUPPORT_TOPICS.find(item => item.id === previousTopic);
  if (topic) return result(topic.next, [topic], topic.id);
  if (/這頁|這一頁|目前頁面/.test(query)) topic = SUPPORT_TOPICS.find(item => `/${item.route}` === pathname);
  if (!topic) {
    const scored = SUPPORT_TOPICS.map(item => ({ item, score: item.terms.reduce((n, word) => n + (query.includes(word) ? word.length : 0), 0) })).sort((a, b) => b.score - a.score);
    if (scored[0]?.score > 0) topic = scored[0].item;
  }
  if (topic) return result(topic.answer, [topic], topic.id);
  return result("我可以協助風格測驗、方案、提案、生圖與網站操作。請告訴我您在哪一頁、按了什麼，以及出現什麼訊息；目前資訊不足，我不會猜測帳務或案件狀態。", SUPPORT_TOPICS.filter(item => ["style", "proposal", "image"].includes(item.id)));
}
