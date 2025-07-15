import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { app } from "./../firebase"; // adjust as needed

export async function trackVisitor() {
  const db = getFirestore(app);
  try {
    const ip = await fetch("https://api.ipify.org?format=json").then(res => res.json());
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const hashedKey = btoa(ip.ip + today); // simple base64 hash
    await setDoc(doc(db, "visitors", hashedKey), {
      ip: ip.ip,
      date: today,
      timestamp: serverTimestamp()
    });
    console.log("Visitor tracked:", hashedKey);
  } catch (error) {
    console.error("Visitor tracking failed:", error);
  }
}
