/* ============================================================================
 *   👇  SIRF YE EK LINE BADALNI HAI — quotes ke andar apna password likho
 *       (baaki poora file jaisa hai waisa hi rehne do)
 * ============================================================================ */

var ADMIN_PASSWORD = '';      // <-- jaise: var ADMIN_PASSWORD = 'vakeem8740';

/* ============================================================================
 *   Neeche sab kuch pehle se ready hai — kuch edit karne ki zarurat nahi.
 * ============================================================================ */

/******************************************************************************
 * PariMatch support API — Google Apps Script Web App
 * ---------------------------------------------------------------------------
 * Saara data Google Drive me JSON files me + attachments Drive folder me.
 * Koi server / database nahi.
 *
 *   Drive/
 *     PariMatch-Data/
 *       complains.json     ← saari complaints
 *       chat.json          ← live chat messages
 *       uploads.json       ← uploads ka index (name, size, drive file id)
 *     PariMatch-Uploads/   ← asli files (images/PDF/…)
 *
 * Endpoints (frontend ko waise hi dikhte hain jaise pehle):
 *   GET    /api/health
 *   GET    /api/complains?limit=200[&scope=all&type=&status=]
 *   POST   /api/complains
 *   GET    /api/complains/{id}
 *   DELETE /api/complains/{id}
 *   DELETE /api/complains
 *   GET    /api/chat/messages?limit=200
 *   POST   /api/chat/messages
 *   PUT    /api/chat/messages/{id}
 *   DELETE /api/chat/messages/{id}
 *   DELETE /api/chat/messages
 *   POST   /api/uploads            (base64 JSON)
 *
 * ---------------------------------------------------------------------------
 * SETUP
 *  1. script.google.com → New project → ye poora file paste karo (Code.gs)
 *  2. Password: file ki sabse pehli line me ADMIN_PASSWORD = 'apna-password'
 *     (Script Properties me ADMIN_API_TOKEN bhi chalega, par zaruri nahi)
 *  3. Deploy → New deployment → Web app
 *       Execute as:  Me
 *       Who has access: Anyone
 *  4. Jo /exec URL mile, wo frontend ke VITE_API_URL me daalo.
 *****************************************************************************/

var CONFIG = {
  DATA_FOLDER: 'PariMatch-Data',
  UPLOAD_FOLDER: 'PariMatch-Uploads',
  COMPLAINS_FILE: 'complains.json',
  CHAT_FILE: 'chat.json',
  UPLOADS_FILE: 'uploads.json',
  VERSION: '2.0.0-drive',
  MAX_PAGE: 500,

  /* -----------------------------------------------------------------
   * ADMIN — do me se koi ek tarika chuno:
   *
   *  (A) sabse aasan: neeche ADMIN_TOKEN me apna password likh do
   *      ADMIN_TOKEN: 'mera-password-123',
   *      aur Deploy → Manage deployments → ✏️ Edit → New version → Deploy
   *
   *  (B) Script Properties se: Project Settings → Script Properties →
   *      ADMIN_API_TOKEN = mera-password-123   (code me kuch badalne ki
   *      zarurat nahi, par deploy ke baad bhi "New version" karna hota hai)
   *
   *  (C) Token hi nahi chahiye? ALLOW_PUBLIC_LIST: true kar do —
   *      tab admin page bina token ke saari complaints dikha dega
   *      (⚠️ URL jiske paas hai wo sab padh lega).
   * ----------------------------------------------------------------- */
  ADMIN_TOKEN: '',
  ALLOW_PUBLIC_LIST: false,
  // Attachments Drive me public link se serve hote hain, isliye folder share
  // karne ki zarurat nahi — script file ko "anyone with link" kar deta hai.
  PUBLIC_LINKS: true
};

/* =========================================================================
 *  Drive storage helpers
 * ========================================================================= */

function dataFolder_() {
  var it = DriveApp.getFoldersByName(CONFIG.DATA_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CONFIG.DATA_FOLDER);
}

function uploadFolder_() {
  var it = DriveApp.getFoldersByName(CONFIG.UPLOAD_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CONFIG.UPLOAD_FOLDER);
}

function findFile_(name) {
  var it = dataFolder_().getFilesByName(name);
  return it.hasNext() ? it.next() : null;
}

function readJson_(name, fallback) {
  var file = findFile_(name);
  if (!file) return fallback;
  var txt = file.getBlob().getDataAsString('UTF-8');
  if (!txt) return fallback;
  try {
    return JSON.parse(txt);
  } catch (e) {
    return fallback;
  }
}

function writeJson_(name, data) {
  var folder = dataFolder_();
  var txt = JSON.stringify(data);
  var file = findFile_(name);
  if (file) {
    file.setContent(txt);
    return file;
  }
  return folder.createFile(name, txt, 'application/json');
}

/** Serialise all writes so two tabs don't clobber each other. */
function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

/** Token = Script Properties ki value, warna CONFIG.ADMIN_TOKEN. */
function adminToken_() {
  if (String(ADMIN_PASSWORD || '')) return String(ADMIN_PASSWORD);
  var fromProps = '';
  try {
    fromProps = String(PropertiesService.getScriptProperties().getProperty('ADMIN_API_TOKEN') || '');
  } catch (err) {
    fromProps = '';
  }
  if (fromProps) return fromProps;
  return String(CONFIG.ADMIN_TOKEN || '');
}

function isAdmin_(given) {
  if (CONFIG.ALLOW_PUBLIC_LIST) return true;
  var expected = adminToken_();
  if (!expected) return false;
  return String(given || '') === expected;
}

/* =========================================================================
 *  Small utilities
 * ========================================================================= */

function id_(prefix) {
  return (prefix || 'id') + '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16);
}

function nowIso_() {
  return new Date().toISOString();
}

function str_(v, max) {
  var s = (v === null || v === undefined) ? '' : String(v);
  s = s.replace(/\s+/g, ' ').trim();
  return max ? s.slice(0, max) : s;
}

function int_(v, def, min, max) {
  var n = parseInt(v, 10);
  if (isNaN(n)) n = def;
  if (min !== undefined && n < min) n = min;
  if (max !== undefined && n > max) n = max;
  return n;
}

/** sha256 hex — complaint passwords kabhi plain me store nahi hote. */
function hash_(text) {
  if (!text) return '';
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text), Utilities.Charset.UTF_8);
  return bytes.map(function (b) {
    return ('0' + (b & 0xff).toString(16)).slice(-2);
  }).join('');
}

/* =========================================================================
 *  Normalisers (frontend ko yahi shape chahiye)
 * ========================================================================= */

function fileOut_(f) {
  if (!f || typeof f !== 'object') return null;
  return {
    name: str_(f.name, 200) || 'file',
    type: str_(f.type, 120),
    size: int_(f.size, 0, 0),
    url: str_(f.url, 500),
    data: typeof f.data === 'string' ? f.data : ''
  };
}

function filesOut_(files) {
  var out = {};
  if (!files || typeof files !== 'object') return out;
  Object.keys(files).forEach(function (key) {
    var f = fileOut_(files[key]);
    if (f) out[key] = f;
  });
  return out;
}

function complainOut_(row) {
  return {
    id: String(row.id),
    type: str_(row.type, 60),
    title: str_(row.title, 255),
    status: str_(row.status, 30) || 'pending',
    createdAt: row.created_at || nowIso_(),
    updatedAt: row.updated_at || row.created_at || nowIso_(),
    details: row.details || {},
    hasPassword: !!row.password_hash,
    files: filesOut_(row.files)
  };
}

function chatOut_(row) {
  return {
    id: String(row.id),
    sender: row.sender === 'support' || row.sender === 'admin' ? row.sender : 'user',
    text: String(row.text || ''),
    createdAt: row.created_at || nowIso_(),
    edited: !!row.edited,
    file: fileOut_(row.file)
  };
}

/* =========================================================================
 *  HTTP entry points
 * ========================================================================= */

function doGet(e) {
  return handle_(e, 'GET');
}

function doPost(e) {
  return handle_(e, 'POST');
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * GET  : sab kuch query params se (path, client_id, admin_token, …)
 * POST : ek hi text/plain body — { path, method, clientId, adminToken, body, query }
 *        (Apps Script CORS preflight ka jawab nahi de sakta, isliye POST ke
 *         andar method bheja jata hai — PUT/DELETE bhi POST se chalte hain.)
 */
function handle_(e, httpMethod) {
  var params = (e && e.parameter) || {};
  var payload = {};
  if (httpMethod === 'POST' && e && e.postData && e.postData.contents) {
    try {
      payload = JSON.parse(e.postData.contents) || {};
    } catch (err) {
      payload = {};
    }
  }

  var path = String(payload.path || params.path || '/api/health');
  var method = String(payload.method || params.method || httpMethod).toUpperCase();
  var clientId = String(payload.clientId || params.client_id || params.clientId || '');
  var adminToken = String(payload.adminToken || params.admin_token || '');
  var body = (payload.body && typeof payload.body === 'object') ? payload.body : {};
  var query = payload.query && typeof payload.query === 'object' ? payload.query : params;

  var result;
  try {
    result = route_(path, method, clientId, adminToken, query, body);
  } catch (err) {
    result = { ok: false, error: String((err && err.message) || err) };
  }

  if (!result) result = { ok: false, error: 'Empty response' };
  if (result.ok === undefined) result.ok = true;
  return json_(result);
}

/* =========================================================================
 *  Router
 * ========================================================================= */

function route_(path, method, clientId, adminToken, query, body) {
  path = String(path || '').split('?')[0];
  if (path.length > 1 && path.charAt(path.length - 1) === '/') {
    path = path.slice(0, -1);
  }

  /* ---------- health ---------- */
  if (path === '/api/health' || path === '/health' || path === '/' || path === '/api') {
    var complains = readJson_(CONFIG.COMPLAINS_FILE, []);
    var chat = readJson_(CONFIG.CHAT_FILE, []);
    return {
      ok: true,
      service: 'parimatch-support-drive',
      version: CONFIG.VERSION,
      time: nowIso_(),
      storage: 'google-drive',
      db: 'json',
      db_driver: 'drive-json',
      db_path: CONFIG.DATA_FOLDER + '/' + CONFIG.COMPLAINS_FILE,
      db_persistent: true,
      upload_dir: CONFIG.UPLOAD_FOLDER,
      upload_persistent: true,
      counts: { complains: complains.length, chat: chat.length },
      admin_scope_enabled: CONFIG.ALLOW_PUBLIC_LIST || !!adminToken_(),
      public_list: !!CONFIG.ALLOW_PUBLIC_LIST
    };
  }

  /* ---------- complaints ---------- */
  if (path === '/api/complains') {
    if (method === 'GET') return listComplains_(clientId, adminToken, query);
    if (method === 'POST') return createComplain_(clientId, body);
    if (method === 'DELETE') return clearComplains_(clientId);
  }

  var m = path.match(/^\/api\/complains\/([A-Za-z0-9._-]{1,64})$/);
  if (m) {
    if (method === 'GET') return getComplain_(clientId, adminToken, m[1]);
    if (method === 'DELETE') return deleteComplain_(clientId, m[1]);
  }

  /* ---------- chat ---------- */
  if (path === '/api/chat/messages' || path === '/api/chat') {
    if (method === 'GET') return listChat_(clientId);
    if (method === 'POST') return createChat_(clientId, body);
    if (method === 'DELETE') return clearChat_(clientId);
  }

  var c = path.match(/^\/api\/chat\/messages\/([A-Za-z0-9._-]{1,64})$/);
  if (c) {
    if (method === 'PUT' || method === 'PATCH') return updateChat_(clientId, c[1], body);
    if (method === 'DELETE') return deleteChat_(clientId, c[1]);
  }

  /* ---------- uploads ---------- */
  if (path === '/api/uploads' || path === '/api/upload') {
    if (method === 'POST') return createUpload_(clientId, body);
  }

  var u = path.match(/^\/api\/uploads\/([A-Za-z0-9._-]{1,64})$/);
  if (u && method === 'GET') return getUpload_(u[1]);

  return { ok: false, error: 'Not found: ' + method + ' ' + path, code: 404 };
}

/* =========================================================================
 *  Complaints
 * ========================================================================= */

function listComplains_(clientId, adminToken, query) {
  var limit = int_(query.limit, 200, 1, CONFIG.MAX_PAGE);
  var scope = str_(query.scope || 'mine');
  var type = str_(query.type || '');
  var status = str_(query.status || '');

  if (scope === 'all' && !isAdmin_(adminToken)) {
    return { ok: false, error: 'Admin token required', code: 401 };
  }
  if (scope !== 'all' && !clientId) {
    return { ok: false, error: 'Missing client id', code: 400 };
  }

  var rows = readJson_(CONFIG.COMPLAINS_FILE, []).filter(function (row) {
    if (!row) return false;
    if (scope !== 'all' && String(row.client_id) !== String(clientId)) return false;
    if (type && String(row.type) !== type) return false;
    if (status && String(row.status) !== status) return false;
    return true;
  });

  rows.sort(function (a, b) {
    return String(b.created_at || '').localeCompare(String(a.created_at || ''));
  });

  var data = rows.slice(0, limit).map(complainOut_);
  return { ok: true, data: data, count: data.length };
}

function getComplain_(clientId, adminToken, id) {
  var rows = readJson_(CONFIG.COMPLAINS_FILE, []);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].id) !== String(id)) continue;
    var mine = String(rows[i].client_id) === String(clientId);
    if (!mine && !isAdmin_(adminToken)) {
      return { ok: false, error: 'Complain not found', code: 404 };
    }
    return { ok: true, data: complainOut_(rows[i]) };
  }
  return { ok: false, error: 'Complain not found', code: 404 };
}

function createComplain_(clientId, body) {
  if (!clientId) return { ok: false, error: 'Missing client id', code: 400 };

  var details = (body.details && typeof body.details === 'object') ? body.details : {};
  var type = str_(body.type, 60);
  var userName = str_(details.userName || details.user_name || '', 120);

  if (!type) return { ok: false, error: 'type is required', code: 422 };
  if (!userName) return { ok: false, error: 'userName is required', code: 422 };

  var mobile = str_(details.mobile || '', 32);
  if (!mobile) return { ok: false, error: 'A valid mobile number is required', code: 422 };

  var password = str_(details.password || '', 200);
  var cleanDetails = {};
  var known = { userName: 1, user_name: 1, mobile: 1, email: 1, password: 1, amount: 1,
                depositAmount: 1, withdrawalAmount: 1, message: 1 };
  Object.keys(details).forEach(function (k) {
    if (known[k]) return;
    cleanDetails[k] = details[k];
  });
  cleanDetails.userName = userName;
  cleanDetails.mobile = mobile;
  var email = str_(details.email || '', 190);
  if (email) cleanDetails.email = email;
  var amount = str_(details.depositAmount || details.withdrawalAmount || details.amount || '', 50);
  if (amount) cleanDetails.amount = amount;
  var message = str_(details.message || '', 5000);
  if (message) cleanDetails.message = message;

  var id = str_(body.id, 64) || id_('cmp');
  var createdAt = str_(body.createdAt, 40) || nowIso_();

  var row = {
    id: id,
    client_id: clientId,
    type: type,
    title: str_(body.title, 255) || (type + ' Complain'),
    status: 'pending',
    details: cleanDetails,
    files: body.files && typeof body.files === 'object' ? body.files : {},
    password_hash: hash_(password),
    created_at: createdAt,
    updated_at: nowIso_()
  };

  var saved = withLock_(function () {
    var rows = readJson_(CONFIG.COMPLAINS_FILE, []);
    var replaced = false;
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i].id) === String(id)) {
        row.status = rows[i].status || row.status;
        row.created_at = rows[i].created_at || row.created_at;
        rows[i] = row;
        replaced = true;
        break;
      }
    }
    if (!replaced) rows.push(row);
    writeJson_(CONFIG.COMPLAINS_FILE, rows);
    return row;
  });

  return { ok: true, data: complainOut_(saved) };
}

function deleteComplain_(clientId, id) {
  var removed = false;
  withLock_(function () {
    var rows = readJson_(CONFIG.COMPLAINS_FILE, []);
    var keep = [];
    rows.forEach(function (row) {
      if (String(row.id) === String(id) && String(row.client_id) === String(clientId)) {
        removed = true;
        return;
      }
      keep.push(row);
    });
    if (removed) writeJson_(CONFIG.COMPLAINS_FILE, keep);
  });

  if (!removed) return { ok: false, error: 'Complain not found', code: 404 };
  return { ok: true };
}

function clearComplains_(clientId) {
  if (!clientId) return { ok: false, error: 'Missing client id', code: 400 };
  var deleted = 0;
  withLock_(function () {
    var rows = readJson_(CONFIG.COMPLAINS_FILE, []);
    var keep = rows.filter(function (row) {
      if (String(row.client_id) === String(clientId)) {
        deleted++;
        return false;
      }
      return true;
    });
    writeJson_(CONFIG.COMPLAINS_FILE, keep);
  });
  return { ok: true, deleted: deleted };
}

/* =========================================================================
 *  Chat
 * ========================================================================= */

function listChat_(clientId) {
  if (!clientId) return { ok: false, error: 'Missing client id', code: 400 };
  var rows = readJson_(CONFIG.CHAT_FILE, []);
  var mine = rows.filter(function (row) {
    return row && String(row.client_id) === String(clientId);
  });
  mine.sort(function (a, b) {
    return String(a.created_at || '').localeCompare(String(b.created_at || ''));
  });
  return { ok: true, data: mine.map(chatOut_), count: mine.length };
}

function createChat_(clientId, body) {
  if (!clientId) return { ok: false, error: 'Missing client id', code: 400 };
  var text = String(body.text || '');
  var file = body.file && typeof body.file === 'object' ? body.file : null;
  if (!text && !file) return { ok: false, error: 'text or file is required', code: 422 };

  var row = {
    id: str_(body.id, 64) || id_('msg'),
    client_id: clientId,
    sender: body.sender === 'support' || body.sender === 'admin' ? body.sender : 'user',
    text: text,
    file: file,
    edited: false,
    created_at: str_(body.createdAt, 40) || nowIso_(),
    updated_at: nowIso_()
  };

  withLock_(function () {
    var rows = readJson_(CONFIG.CHAT_FILE, []);
    var found = false;
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i].id) === String(row.id)) {
        rows[i] = row;
        found = true;
        break;
      }
    }
    if (!found) rows.push(row);
    writeJson_(CONFIG.CHAT_FILE, rows);
  });

  return { ok: true, data: chatOut_(row) };
}

function updateChat_(clientId, id, body) {
  var updated = null;
  withLock_(function () {
    var rows = readJson_(CONFIG.CHAT_FILE, []);
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i].id) !== String(id)) continue;
      if (String(rows[i].client_id) !== String(clientId)) return;
      rows[i].text = String(body.text !== undefined ? body.text : rows[i].text);
      rows[i].edited = true;
      rows[i].updated_at = nowIso_();
      updated = rows[i];
      break;
    }
    if (updated) writeJson_(CONFIG.CHAT_FILE, rows);
  });

  if (!updated) return { ok: false, error: 'Message not found', code: 404 };
  return { ok: true, data: chatOut_(updated) };
}

function deleteChat_(clientId, id) {
  var removed = false;
  withLock_(function () {
    var rows = readJson_(CONFIG.CHAT_FILE, []);
    var keep = rows.filter(function (row) {
      if (String(row.id) === String(id) && String(row.client_id) === String(clientId)) {
        removed = true;
        return false;
      }
      return true;
    });
    if (removed) writeJson_(CONFIG.CHAT_FILE, keep);
  });

  if (!removed) return { ok: false, error: 'Message not found', code: 404 };
  return { ok: true };
}

function clearChat_(clientId) {
  if (!clientId) return { ok: false, error: 'Missing client id', code: 400 };
  var deleted = 0;
  withLock_(function () {
    var rows = readJson_(CONFIG.CHAT_FILE, []);
    var keep = rows.filter(function (row) {
      if (String(row.client_id) === String(clientId)) {
        deleted++;
        return false;
      }
      return true;
    });
    writeJson_(CONFIG.CHAT_FILE, keep);
  });
  return { ok: true, deleted: deleted };
}

/* =========================================================================
 *  Uploads  (base64 JSON → Drive file)
 * ========================================================================= */

function createUpload_(clientId, body) {
  if (!clientId) return { ok: false, error: 'Missing client id', code: 400 };

  var name = str_(body.name, 200) || 'file';
  var mime = str_(body.type, 120) || 'application/octet-stream';
  var base64 = String(body.data || '');
  if (!base64) return { ok: false, error: 'No file data', code: 422 };

  var bytes = Utilities.base64Decode(base64);
  var blob = Utilities.newBlob(bytes, mime, name);

  var folder = uploadFolder_();
  var file = folder.createFile(blob);
  if (CONFIG.PUBLIC_LINKS) {
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (err) {
      // Workspace domain ne sharing band ki ho to link phir bhi banega,
      // bas sirf owner ke liye khulega.
    }
  }

  var driveId = file.getId();
  var isImage = mime.indexOf('image/') === 0;
  var url = isImage
    ? 'https://lh3.googleusercontent.com/d/' + driveId + '=w1200'
    : 'https://drive.google.com/uc?export=download&id=' + driveId;

  var record = {
    id: id_('up'),
    client_id: clientId,
    name: name,
    type: mime,
    size: bytes.length,
    drive_id: driveId,
    url: url,
    created_at: nowIso_()
  };

  withLock_(function () {
    var index = readJson_(CONFIG.UPLOADS_FILE, {});
    index[record.id] = record;
    writeJson_(CONFIG.UPLOADS_FILE, index);
  });

  return {
    ok: true,
    data: {
      id: record.id,
      name: record.name,
      type: record.type,
      size: record.size,
      url: record.url
    }
  };
}

function getUpload_(id) {
  var index = readJson_(CONFIG.UPLOADS_FILE, {});
  var row = index[id];
  if (!row) return { ok: false, error: 'Upload not found', code: 404 };
  return { ok: true, data: row };
}

/* =========================================================================
 *  Maintenance (manually run from the editor if ever needed)
 * ========================================================================= */

/** Purani complaints ko Drive me alag file me backup kar deta hai. */
function backupData() {
  var stamp = Utilities.formatDate(new Date(), 'GMT', 'yyyyMMdd-HHmmss');
  var folder = dataFolder_();
  [CONFIG.COMPLAINS_FILE, CONFIG.CHAT_FILE, CONFIG.UPLOADS_FILE].forEach(function (name) {
    var file = findFile_(name);
    if (!file) return;
    folder.createFile(name.replace('.json', '') + '-' + stamp + '.json', file.getBlob());
  });
}

/** Sab kuch khaali (delete) — soch samajh ke chalao. */
function resetAllData() {
  writeJson_(CONFIG.COMPLAINS_FILE, []);
  writeJson_(CONFIG.CHAT_FILE, []);
  writeJson_(CONFIG.UPLOADS_FILE, {});
}
