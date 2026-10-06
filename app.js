(function () {
  var COLS = ["伝票日", "営業所", "店舗", "品名", "材質", "厚み", "W", "D", "枚数", "加工", "納期", "備考"];
  var OFFICE_COLOR = {
    "京都": "#cfe8d5",
    "奈良": "#d9e4f5",
    "和歌山": "#f7e2c3",
    "滋賀": "#e6d4f2",
    "南大阪": "#f5d0d0"
  };
  var SAMPLE = [
    ["2026/10/06", "京都", "松屋四条", "作業台天板", "SUS304", "1.5", "1800", "750", "2", "前R", "2026/10/14", "既存台の入替"],
    ["2026/10/06", "京都", "松屋四条", "壁付棚板", "SUS304", "1.2", "900", "350", "1", "なし", "2026/10/14", ""],
    ["2026/10/06", "京都", "松屋河原町", "ガス台天板", "SUS304", "1.5", "900", "750", "1", "バーナー穴3", "2026/10/15", "φ48"],
    ["2026/10/06", "京都", "松屋山科", "シンク台天板", "SUS304", "1.5", "1500", "750", "1", "シンク穴1", "2026/10/16", "穴位置図別紙"],
    ["2026/10/06", "奈良", "松屋奈良", "作業台天板", "SUS304", "1.5", "1800", "750", "1", "前R", "2026/10/14", ""],
    ["2026/10/06", "奈良", "松屋奈良", "作業台天板", "SUS304", "1.5", "1200", "750", "1", "なし", "2026/10/14", ""],
    ["2026/10/06", "奈良", "松屋生駒", "ソイルド天板", "SUS304", "1.5", "600", "750", "2", "なし", "2026/10/17", "ダスト横"],
    ["2026/10/06", "奈良", "松屋橿原", "ガス台天板", "SUS304", "1.5", "750", "600", "1", "バーナー穴2", "2026/10/17", ""],
    ["2026/10/06", "和歌山", "松屋和歌山", "作業台天板", "SUS304", "1.5", "2100", "750", "1", "前R+穴2", "2026/10/15", ""],
    ["2026/10/06", "和歌山", "松屋海南", "シンク台天板", "SUS304", "1.5", "1200", "750", "1", "シンク穴1", "2026/10/16", ""],
    ["2026/10/06", "和歌山", "松屋田辺", "壁付棚板", "SUS304", "1.2", "1200", "300", "2", "なし", "2026/10/20", ""],
    ["2026/10/06", "滋賀", "松屋大津", "作業台天板", "SUS304", "1.5", "1500", "750", "2", "前R", "2026/10/14", ""],
    ["2026/10/06", "滋賀", "松屋草津", "ガス台天板", "SUS304", "1.5", "900", "750", "1", "バーナー穴3", "2026/10/15", "φ48"],
    ["2026/10/06", "滋賀", "松屋彦根", "ソイルド天板", "SUS304", "1.5", "750", "750", "1", "なし", "2026/10/18", ""],
    ["2026/10/06", "南大阪", "松屋堺東", "作業台天板", "SUS304", "1.5", "1800", "750", "1", "前R", "2026/10/14", ""],
    ["2026/10/06", "南大阪", "松屋堺東", "シンク台天板", "SUS304", "1.5", "1800", "750", "1", "シンク穴2", "2026/10/14", "二槽"],
    ["2026/10/06", "南大阪", "松屋阿倍野", "ガス台天板", "SUS304", "1.5", "1200", "750", "1", "バーナー穴4", "2026/10/16", ""],
    ["2026/10/06", "南大阪", "松屋東大阪", "作業台天板", "SUS304", "1.5", "900", "600", "3", "なし", "2026/10/17", "サブ台"]
  ];
  var MASTER = [
    ["作業台天板", 12800, "SUS1.5 基準。面積補正あり"],
    ["シンク台天板", 16200, "穴加工は別加算"],
    ["ガス台天板", 14100, "バーナー穴は個数加算"],
    ["壁付棚板", 5400, "1.2t"],
    ["ソイルド天板", 9800, ""]
  ];
  var rows = [];
  var packed = [];
  var tokushu = [];
  var invoices = [];
  var labels = [];

  var C39 = {
    "0": "nnnwwnwnn", "1": "wnnwnnnnw", "2": "nnwwnnnnw", "3": "wnwwnnnnn",
    "4": "nnnwwnnnw", "5": "wnnwwnnnn", "6": "nnwwwnnnn", "7": "nnnwnnwnw",
    "8": "wnnwnnwnn", "9": "nnwwnnwnn", "A": "wnnnnwnnw", "B": "nnwnnwnnw",
    "C": "wnwnnwnnn", "D": "nnnnwwnnw", "E": "wnnnwwnnn", "F": "nnwnwwnnn",
    "G": "nnnnnwwnw", "H": "wnnnnwwnn", "I": "nnwnnwwnn", "J": "nnnnwwwnn",
    "K": "wnnnnnnww", "L": "nnwnnnnww", "M": "wnwnnnnwn", "N": "nnnnwnnww",
    "O": "wnnnwnnwn", "P": "nnwnwnnwn", "Q": "nnnnnnwww", "R": "wnnnnnwwn",
    "S": "nnwnnnwwn", "T": "nnnnwnwwn", "U": "wwnnnnnnw", "V": "nwwnnnnnw",
    "W": "wwwnnnnnn", "X": "nwnnwnnnw", "Y": "wwnnwnnnn", "Z": "nwwnwnnnn",
    "-": "nwnnnnwnw", ".": "wwnnnnwnn", " ": "nwwnnnwnn", "*": "nwnnwnwnn"
  };

  function yen(n) {
    return "\u00A5" + Math.round(n).toLocaleString("ja-JP");
  }
  function num(v) {
    var n = parseFloat(String(v).replace(/,/g, ""));
    return isFinite(n) ? n : 0;
  }
  function pad(n, w) {
    var s = String(n);
    while (s.length < w) s = "0" + s;
    return s;
  }
  function setStat(t) {
    document.getElementById("statLeft").textContent = t;
  }
  function showSheet(id) {
    var sheets = document.querySelectorAll(".sheet");
    var i;
    for (i = 0; i < sheets.length; i++) sheets[i].classList.remove("on");
    document.getElementById(id).classList.add("on");
    var tabs = document.querySelectorAll(".tabs button");
    for (i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle("on", tabs[i].getAttribute("data-sheet") === id);
    }
    var names = {
      sheetHatchu: "発注一覧",
      sheetNarabe: "並べ表",
      sheetSeikyu: "請求書",
      sheetLabel: "ラベル台",
      sheetMaster: "単価マスタ"
    };
    document.getElementById("cellName").textContent = "A1";
    document.getElementById("cellVal").textContent = names[id] || id;
  }
  function renderHatchu() {
    var t = document.getElementById("tblHatchu");
    var h = "<tr><th></th>";
    var i, j, r;
    for (i = 0; i < COLS.length; i++) h += "<th>" + COLS[i] + "</th>";
    h += "</tr>";
    for (i = 0; i < rows.length; i++) {
      r = rows[i];
      h += "<tr><th>" + (i + 2) + "</th>";
      for (j = 0; j < COLS.length; j++) {
        h += "<td contenteditable=\"true\" data-r=\"" + i + "\" data-c=\"" + j + "\"" +
          (j === 6 || j === 7 || j === 8 || j === 5 ? " class=\"n\"" : "") + ">" +
          (r[j] || "") + "</td>";
      }
      h += "</tr>";
    }
    t.innerHTML = h;
    var cells = t.querySelectorAll("td[contenteditable]");
    for (i = 0; i < cells.length; i++) {
      cells[i].addEventListener("focus", function () {
        document.getElementById("cellName").textContent = COLS[num(this.getAttribute("data-c"))].charAt(0) + (num(this.getAttribute("data-r")) + 2);
        document.getElementById("cellVal").textContent = this.textContent;
      });
      cells[i].addEventListener("blur", function () {
        var rr = num(this.getAttribute("data-r"));
        var cc = num(this.getAttribute("data-c"));
        rows[rr][cc] = this.textContent.replace(/\s+$/, "");
      });
    }
    setStat("発注 " + rows.length + " 行");
  }
  function renderMaster() {
    var t = document.getElementById("tblMaster");
    var h = "<tr><th></th><th>品名</th><th>基準単価</th><th>メモ</th></tr>";
    var i;
    for (i = 0; i < MASTER.length; i++) {
      h += "<tr><th>" + (i + 2) + "</th><td>" + MASTER[i][0] + "</td><td class=\"n\">" +
        MASTER[i][1] + "</td><td>" + MASTER[i][2] + "</td></tr>";
    }
    h += "<tr><td colspan=\"4\" style=\"padding:8px;background:#fafafa\">面積補正：基準単価 × (W×D) / (1800×750)。穴1つ +1,800／前R +900。消費税10%。</td></tr>";
    t.innerHTML = h;
  }
  function tankaOf(row) {
    var name = row[3];
    var i, base = 0;
    for (i = 0; i < MASTER.length; i++) {
      if (MASTER[i][0] === name) { base = MASTER[i][1]; break; }
    }
    var w = num(row[6]), d = num(row[7]);
    var areaHi = (1800 * 750);
    var k = areaHi ? (w * d) / areaHi : 1;
    if (k < 0.35) k = 0.35;
    var t = Math.round(base * k);
    var kako = row[9] || "";
    var holes = kako.match(/穴(\d+)/);
    if (holes) t += 1800 * num(holes[1]);
    else if (kako.indexOf("穴") >= 0) t += 1800;
    if (kako.indexOf("R") >= 0) t += 900;
    return t;
  }
  function expandPieces() {
    var list = [];
    var i, q, qty, w, d;
    for (i = 0; i < rows.length; i++) {
      qty = num(rows[i][8]);
      w = num(rows[i][6]);
      d = num(rows[i][7]);
      if (qty <= 0 || w <= 0 || d <= 0) continue;
      for (q = 0; q < qty; q++) {
        list.push({
          src: i,
          office: rows[i][1],
          store: rows[i][2],
          name: rows[i][3],
          mat: rows[i][5] ? rows[i][4] + " t" + rows[i][5] : rows[i][4],
          kako: rows[i][9] || "",
          w: w,
          d: d,
          due: rows[i][10]
        });
      }
    }
    return list;
  }
  function packAll() {
    var bw = num(document.getElementById("boardW").value);
    var bh = num(document.getElementById("boardH").value);
    var kerf = num(document.getElementById("kerf").value);
    if (bw < 100 || bh < 100) {
      alert("原板サイズを確認してください。");
      return;
    }
    var items = expandPieces();
    items.sort(function (a, b) {
      return Math.max(b.w, b.d) - Math.max(a.w, a.d);
    });
    packed = [];
    tokushu = [];
    var boards = [];
    var n, it, w, d, rot, placed, b, k;

    function newBoard() {
      return { no: boards.length + 1, x: 0, y: 0, rowH: 0, pieces: [] };
    }
    boards.push(newBoard());

    for (n = 0; n < items.length; n++) {
      it = items[n];
      w = it.w;
      d = it.d;
      rot = false;
      if (w > bw || d > bh) {
        if (d <= bw && w <= bh) {
          w = it.d; d = it.w; rot = true;
        } else {
          tokushu.push(it);
          continue;
        }
      }
      placed = false;
      for (k = 0; k < boards.length; k++) {
        b = boards[k];
        if (tryPlace(b, it, w, d, rot, bw, bh, kerf)) { placed = true; break; }
        if (tryPlace(b, it, d, w, !rot, bw, bh, kerf)) { placed = true; break; }
      }
      if (!placed) {
        b = newBoard();
        boards.push(b);
        if (!tryPlace(b, it, w, d, rot, bw, bh, kerf) && !tryPlace(b, it, d, w, !rot, bw, bh, kerf)) {
          tokushu.push(it);
          boards.pop();
        }
      }
    }
    packed = boards;
    var pcs = 0, used = 0;
    for (k = 0; k < packed.length; k++) {
      for (n = 0; n < packed[k].pieces.length; n++) {
        pcs++;
        used += packed[k].pieces[n].w * packed[k].pieces[n].d;
      }
    }
    var yld = packed.length ? Math.round(used / (packed.length * bw * bh) * 1000) / 10 : 0;
    setStat("原板 " + packed.length + " 枚 / 部材 " + pcs + " / 特寸 " + tokushu.length + " / 歩留 " + yld + "%");
    drawNarabe(bw, bh);
    showSheet("sheetNarabe");
  }
  function tryPlace(b, it, w, d, rot, bw, bh, kerf) {
    var x = b.x, y = b.y, rowH = b.rowH;
    if (x > 0 && x + w > bw) {
      y = y + rowH + kerf;
      x = 0;
      rowH = 0;
    }
    if (y + d > bh) return false;
    if (x + w > bw) return false;
    b.pieces.push({
      office: it.office, store: it.store, name: it.name, mat: it.mat, kako: it.kako,
      w: w, d: d, rot: rot, x: x, y: y, due: it.due, src: it.src
    });
    if (d > rowH) rowH = d;
    b.x = x + w + kerf;
    b.y = y;
    b.rowH = rowH;
    return true;
  }
  function drawNarabe(bw, bh) {
    var el = document.getElementById("narabeOut");
    var scale = 0.28;
    var html = "";
    var i, j, p, fill, b;
    html += "<p style=\"margin:0 0 10px;font-size:12px\">原板 " + bw + " × " + bh + "　刃幅 " +
      document.getElementById("kerf").value + "mm　色は営業所</p>";
    if (!packed.length) {
      el.innerHTML = "<p class=\"warn\">部材がありません。</p>";
      return;
    }
    for (i = 0; i < packed.length; i++) {
      b = packed[i];
      html += "<div class=\"board-wrap\"><h3>原板 " + b.no + "　（" + b.pieces.length + "枚取り）</h3>";
      html += "<svg class=\"svg-board\" width=\"" + Math.round(bw * scale) + "\" height=\"" +
        Math.round(bh * scale) + "\" viewBox=\"0 0 " + bw + " " + bh + "\">";
      html += "<rect x=\"0\" y=\"0\" width=\"" + bw + "\" height=\"" + bh + "\" fill=\"#efebe0\" stroke=\"#555\"/>";
      for (j = 0; j < b.pieces.length; j++) {
        p = b.pieces[j];
        fill = OFFICE_COLOR[p.office] || "#ddd";
        html += "<g>";
        html += "<rect class=\"piece\" x=\"" + p.x + "\" y=\"" + p.y + "\" width=\"" + p.w +
          "\" height=\"" + p.d + "\" fill=\"" + fill + "\"/>";
        html += "<text class=\"plabel\" x=\"" + (p.x + 8) + "\" y=\"" + (p.y + 22) + "\">" +
          esc(p.store) + "</text>";
        html += "<text class=\"plabel\" x=\"" + (p.x + 8) + "\" y=\"" + (p.y + 42) + "\">" +
          p.w + "×" + p.d + (p.rot ? " 回転" : "") + "</text>";
        html += "<text class=\"plabel\" x=\"" + (p.x + 8) + "\" y=\"" + (p.y + 62) + "\">" +
          esc(p.name) + (p.kako && p.kako !== "なし" ? " / " + esc(p.kako) : "") + "</text>";
        html += "</g>";
      }
      html += "</svg></div>";
    }
    if (tokushu.length) {
      html += "<div class=\"toku\"><b>特寸（原板に入りません・別取り）</b><ul>";
      for (i = 0; i < tokushu.length; i++) {
        html += "<li>" + esc(tokushu[i].store) + "　" + esc(tokushu[i].name) + "　" +
          tokushu[i].w + "×" + tokushu[i].d + "</li>";
      }
      html += "</ul></div>";
    }
    el.innerHTML = html;
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function makeInvoices() {
    var groups = {};
    var i, row, g, t, amt, office;
    for (i = 0; i < rows.length; i++) {
      office = rows[i][1] || "(営業所なし)";
      if (!groups[office]) groups[office] = { office: office, lines: [], sub: 0 };
      t = tankaOf(rows[i]);
      amt = t * num(rows[i][8]);
      groups[office].lines.push({
        store: rows[i][2], name: rows[i][3], spec: rows[i][4] + " t" + rows[i][5],
        size: rows[i][6] + "×" + rows[i][7], qty: num(rows[i][8]), tanka: t, amt: amt, kako: rows[i][9]
      });
      groups[office].sub += amt;
    }
    invoices = [];
    for (g in groups) invoices.push(groups[g]);
    invoices.sort(function (a, b) { return a.office < b.office ? -1 : 1; });
    var el = document.getElementById("seikyuOut");
    var html = "";
    var tax, total, no = 1;
    if (!invoices.length) {
      el.innerHTML = "<p class=\"warn\" style=\"padding:16px\">発注が空です。</p>";
      return;
    }
    for (i = 0; i < invoices.length; i++) {
      g = invoices[i];
      tax = Math.round(g.sub * 0.1);
      total = g.sub + tax;
      html += "<div class=\"invoice\">";
      html += "<div class=\"head\"><h2>御請求書</h2><div class=\"meta\">No. H-2610-" + pad(no, 3) +
        "<br>発行日　2026年10月6日<br>お支払期限　2026年10月31日</div></div>";
      html += "<div class=\"to\"><span class=\"name\">" + esc(g.office) + " 営業所</span>　御中</div>";
      html += "<p>下記の通りご請求申し上げます。（試作・単価は仮）</p>";
      html += "<table><thead><tr><th>店舗</th><th>品名</th><th>仕様</th><th>寸法</th><th>数量</th><th>加工</th><th>単価</th><th>金額</th></tr></thead><tbody>";
      for (var j = 0; j < g.lines.length; j++) {
        row = g.lines[j];
        html += "<tr><td>" + esc(row.store) + "</td><td>" + esc(row.name) + "</td><td>" + esc(row.spec) +
          "</td><td class=\"n\">" + esc(row.size) + "</td><td class=\"n\">" + row.qty +
          "</td><td>" + esc(row.kako) + "</td><td class=\"n\">" + yen(row.tanka) +
          "</td><td class=\"n\">" + yen(row.amt) + "</td></tr>";
      }
      html += "</tbody></table>";
      html += "<table class=\"sum\"><tr><td>小計</td><td class=\"n\">" + yen(g.sub) +
        "</td></tr><tr><td>消費税10%</td><td class=\"n\">" + yen(tax) +
        "</td></tr><tr><td><b>合計</b></td><td class=\"n\"><b>" + yen(total) + "</b></td></tr></table>";
      html += "<div class=\"from\">有限会社ハニー（社名はダミーです）<br>〒564-0000　大阪府吹田市〇〇1-2-3<br>" +
        "TEL 06-0000-0000<br>振込先　三井住友銀行　吹田支店　普通 0000000<br>※本番は御社の請求書レイアウトに合わせます。</div>";
      html += "</div>";
      no++;
    }
    el.innerHTML = html;
    showSheet("sheetSeikyu");
    setStat("請求書 " + invoices.length + " 枚");
  }
  function code39(text) {
    var s = "*" + String(text).toUpperCase() + "*";
    var bits = "";
    var i, j, pat, ch;
    for (i = 0; i < s.length; i++) {
      ch = s.charAt(i);
      if (!C39[ch]) ch = "-";
      pat = C39[ch];
      for (j = 0; j < 9; j++) {
        var wide = pat.charAt(j) === "w";
        var bar = (j % 2 === 0) ? "1" : "0";
        bits += wide ? bar + bar + bar : bar;
      }
      bits += "0";
    }
    return bits;
  }
  function drawBarcode(canvas, text) {
    var bits = code39(text);
    var ctx = canvas.getContext("2d");
    var w = canvas.width, h = canvas.height;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    var barW = Math.floor(w / bits.length);
    if (barW < 1) barW = 1;
    var x0 = Math.floor((w - barW * bits.length) / 2);
    ctx.fillStyle = "#000";
    var i;
    for (i = 0; i < bits.length; i++) {
      if (bits.charAt(i) === "1") ctx.fillRect(x0 + i * barW, 4, barW, h - 8);
    }
  }
  function makeLabels() {
    if (!packed.length) packAll();
    labels = [];
    var i, j, p, code, n = 0;
    for (i = 0; i < packed.length; i++) {
      for (j = 0; j < packed[i].pieces.length; j++) {
        n++;
        p = packed[i].pieces[j];
        code = "H2610-" + pad(packed[i].no, 2) + pad(n, 3);
        labels.push({
          code: code, store: p.store, name: p.name, size: p.w + "x" + p.d,
          kako: p.kako, office: p.office, board: packed[i].no, due: p.due
        });
      }
    }
    for (i = 0; i < tokushu.length; i++) {
      n++;
      p = tokushu[i];
      labels.push({
        code: "TOK-" + pad(n, 3), store: p.store, name: p.name, size: p.w + "x" + p.d,
        kako: p.kako, office: p.office, board: "特寸", due: p.due
      });
    }
    var el = document.getElementById("labelOut");
    var html = "";
    for (i = 0; i < labels.length; i++) {
      html += "<div class=\"label\"><div class=\"store\">" + esc(labels[i].store) +
        "</div><div class=\"s\">" + esc(labels[i].office) + "　原板" + labels[i].board +
        "</div><div class=\"size\">" + esc(labels[i].name) + "　" + labels[i].size +
        "</div><div class=\"s\">" + esc(labels[i].kako) + "　納期 " + esc(labels[i].due) +
        "</div><canvas id=\"bc" + i + "\" width=\"320\" height=\"48\"></canvas><div class=\"s\">" +
        labels[i].code + "</div></div>";
    }
    el.innerHTML = html || "<p class=\"warn\">ラベル対象がありません。</p>";
    for (i = 0; i < labels.length; i++) {
      drawBarcode(document.getElementById("bc" + i), labels[i].code);
    }
    showSheet("sheetLabel");
    setStat("ラベル " + labels.length + " 枚");
  }
  function parseCsv(text) {
    text = text.replace(/^\ufeff/, "");
    var lines = text.split(/\r?\n/);
    var out = [];
    var i, cells, start = 0;
    if (!lines.length) return out;
    if (lines[0].indexOf("伝票日") >= 0) start = 1;
    for (i = start; i < lines.length; i++) {
      if (!lines[i]) continue;
      cells = lines[i].split(",");
      while (cells.length < 12) cells.push("");
      out.push(cells.slice(0, 12));
    }
    return out;
  }
  function loadSample() {
    rows = SAMPLE.map(function (r) { return r.slice(); });
    renderHatchu();
    showSheet("sheetHatchu");
  }

  document.querySelector(".tabs").addEventListener("click", function (e) {
    var t = e.target;
    if (t.tagName === "BUTTON") showSheet(t.getAttribute("data-sheet"));
  });
  document.getElementById("btnSample").onclick = loadSample;
  document.getElementById("btnAdd").onclick = function () {
    rows.push(["2026/10/06", "", "", "", "SUS304", "1.5", "", "", "1", "なし", "", ""]);
    renderHatchu();
  };
  document.getElementById("fileCsv").addEventListener("change", function () {
    var f = this.files && this.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      rows = parseCsv(String(reader.result));
      renderHatchu();
      showSheet("sheetHatchu");
    };
    reader.readAsText(f, "utf-8");
  });
  document.getElementById("btnNarabe").onclick = packAll;
  document.getElementById("btnSeikyu").onclick = makeInvoices;
  document.getElementById("btnLabel").onclick = makeLabels;
  document.getElementById("btnPrint").onclick = function () { window.print(); };

  renderMaster();
  loadSample();
})();
