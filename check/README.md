# Live data check — Firestore

Ek single-file page (koi build nahi). Ye **Firebase Firestore** se data live
padhta hai — refresh button nahi, data aate hi screen pe.

Deploy: Vercel pe naya project → **Root Directory = `check`** → Framework preset
**Other** → Deploy.

## Use kaise karo

1. Kholo `check/index.html`
2. Firebase console → ⚙️ Project settings → Your apps → **`</>`** → `firebaseConfig` block copy karo
3. Wahi block page ke box me paste karo → **Connect**
4. Bas — 🟢 **LIVE** badge aa jayega

Config browser me yaad reh jata hai, agli baar page kholne pe khud connect ho
jata hai. Disconnect karna ho to **Disconnect** dabao.

## Kya dikhata hai

| Cheez | Matlab |
|---|---|
| 🟢 LIVE | Firestore se connection chal raha hai |
| Total complaints | Sabhi browsers (sab clientId) ki complaints, newest pehle |
| Naam + type + time | Deposit / withdrawal / bonus / kyc … |
| Raw JSON | Poora data, copy-paste ke liye |
| Last update | Aakhri change ka time |
| **Test complaint bhejo** | Ek sample complaint likhta hai — write bhi check ho jata hai |

## Website se test

1. Ye page khula rakho
2. Support center → koi complaint submit karo
3. **Bina refresh** usi second page pe dikhegi

## Errors

| Message | Matlab |
|---|---|
| `projectId` / `apiKey` nahi mila | config poora copy nahi hua — dobara copy karo |
| `Firebase SDK load nahi hua` | internet/CDN block — page reload karke try karo |
| `Read fail: permission-denied` | Firestore → Rules → test mode ya `FIREBASE-SETUP.md` ke rules lagao |
| `Connect ho raha hai…` pe atka | Firestore database create nahi hua (Step 2) |

Full setup: [`../FIREBASE-SETUP.md`](../FIREBASE-SETUP.md)
