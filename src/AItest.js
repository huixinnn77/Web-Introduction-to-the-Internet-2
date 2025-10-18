import React, { useEffect, useState } from "react";

export default function AItest() {
  const [apiKey, setApiKey] = useState("");
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberKey, setRememberKey] = useState(true);
  const [voteStats, setVoteStats] = useState({}); 
  const API_URL = "https://api.thecatapi.com/v1/";

  // 讀取本機儲存的 API Key
  useEffect(() => {
    const saved = localStorage.getItem("live_p4NkFCpSOxg5Nknky5V3ZAS6seIDcT8JsUVTaFOlLDPrbFyFRQQbmranyunJ2XtU");
    if (saved) setApiKey(saved);
  }, []);

  // 取得隨機貓咪圖片
  async function fetchCats() {
    if (!apiKey) {
      setError("請輸入你的 Cat API Key");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}images/search?limit=6`, {
        headers: { "x-api-key": apiKey },
      });
      const data = await res.json();
      setCats(data);
      await fetchVoteStats(); // 同步更新投票數
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 取得所有投票統計）
  async function fetchVoteStats() {
    if (!apiKey) {
      setError("請先輸入 Cat API Key 才能顯示統計");
      return;
    }

    try {
      const res = await fetch(`${API_URL}votes?limit=20&order=DESC`, {
        headers: { "x-api-key": apiKey },
      });
      const data = await res.json();

      if (data.length === 0) {
        alert("目前沒有投票紀錄喔！");
        return;
      }

      // 統計每張圖片的 like/dislike
      const stats = {};
      data.forEach((v) => {
        const id = v.image_id;
        if (!stats[id]) stats[id] = { likes: 0, dislikes: 0 };
        if (v.value > 0) stats[id].likes++;
        else stats[id].dislikes++;
      });

      setVoteStats(stats);
      setError("");
      alert("投票統計已更新 📊");
    } catch (err) {
      console.log("取得投票數失敗", err);
      setError("無法取得投票統計");
    }
  }


  // 投票功能
  async function vote(catId, value) {
    try {
      await fetch(`${API_URL}votes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          image_id: catId,
          value, 
        }),
      });
      await fetchVoteStats(); 
    } catch (err) {
      alert("投票失敗：" + err.message);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: 8 }}>🐱 The Cat 投票系統</h2>

        {/* API Key 設定 */}
        <div style={styles.controls}>
          <label style={styles.label}>
            Cat API Key：
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                const v = e.target.value;
                setApiKey(v);
                if (rememberKey) localStorage.setItem("cat_api_key", v);
              }}
              placeholder="請貼上你的 Cat API Key"
              style={styles.input}
            />
          </label>

          <label style={{ fontSize: 12 }}>
            <input
              type="checkbox"
              checked={rememberKey}
              onChange={(e) => {
                setRememberKey(e.target.checked);
                if (!e.target.checked) localStorage.removeItem("cat_api_key");
                else if (apiKey) localStorage.setItem("cat_api_key", apiKey);
              }}
            />
            記住在本機（localStorage）
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={fetchCats} style={styles.btn}>
              取得貓咪圖片 🐾
            </button>
          </div>
        </div>

        {/* 錯誤訊息 */}
        {error && <div style={styles.error}>⚠ {error}</div>}

        {/* 圖片區域 */}
        {loading ? (
          <div>載入中...</div>
        ) : (
          <div style={styles.grid}>
            {cats.map((cat) => (
              <div key={cat.id} style={styles.catCard}>
                <img src={cat.url} alt="cat" style={styles.catImg} />
                <div style={styles.voteBtns}>
                  <button onClick={() => vote(cat.id, 1)} style={styles.like}>
                    👍 喜歡
                  </button>
                  <button onClick={() => vote(cat.id, 0)} style={styles.dislike}>
                    👎 不喜歡
                  </button>
                </div>
                {/* 顯示統計 */}
                {voteStats[cat.id] && (
                  <div style={styles.stats}>
                    👍 {voteStats[cat.id].likes}　
                    👎 {voteStats[cat.id].dislikes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: "grid", placeItems: "center", padding: 20 },
  card: {
    width: "min(900px, 100%)",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  controls: { display: "grid", gap: 8, marginBottom: 12 },
  label: { fontSize: 14 },
  input: {
    padding: "6px 8px",
    borderRadius: 8,
    border: "1px solid #ddd",
    width: "100%",
  },
  btn: {
    padding: "8px 14px",
    borderRadius: 999,
    background: "#111827",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
  },
  btnOutline: {
    padding: "8px 14px",
    borderRadius: 999,
    background: "white",
    color: "#111827",
    border: "1px solid #111827",
    cursor: "pointer",
    fontSize: 14,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
    marginTop: 8,
  },
  catCard: {
    border: "1px solid #eee",
    borderRadius: 8,
    padding: 8,
    textAlign: "center",
    background: "#fafafa",
  },
  catImg: { width: "100%", height: 200, objectFit: "cover", borderRadius: 8 },
  voteBtns: { display: "flex", justifyContent: "center", gap: 8, marginTop: 6 },
  like: {
    padding: "6px 10px",
    borderRadius: 8,
    background: "#10b981",
    border: "none",
    color: "#fff",
    cursor: "pointer",
  },
  dislike: {
    padding: "6px 10px",
    borderRadius: 8,
    background: "#ef4444",
    border: "none",
    color: "#fff",
    cursor: "pointer",
  },
  stats: { fontSize: 13, marginTop: 4, color: "#555" },
  error: { color: "#b91c1c", fontWeight: "bold", marginTop: 8 },
};
