import Image from "next/image";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md w-full">
        <Image
          src="/logo.png"
          alt="חב״ד רמת בית שמש ג׳"
          width={160}
          height={200}
          className="mx-auto mb-8"
        />
        <div className="bg-white rounded-2xl shadow-lg p-10">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: "#511C24" }}>
            תודה רבה!
          </h1>
          <p className="text-gray-600 leading-relaxed">
            הפרטים נקלטו במערכת בהצלחה.
            <br />
            נשמח לראותך בפעילויות הקהילה.
          </p>
          <p className="mt-6 text-sm text-gray-400">חב״ד רמת בית שמש ג׳</p>
        </div>
        <Link
          href="/"
          className="mt-6 inline-block text-sm underline"
          style={{ color: "#511C24" }}
        >
          חזרה לטופס
        </Link>
      </div>
    </main>
  );
}
