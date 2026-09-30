import { useEffect, useRef, useState } from "react";
const STORAGE_KEY = "vipfoods-tour-v1";
const steps = [
  { title: "Welcome to VIP Foods", text: "Take a quick look around. Find your favourites, discover offers, and build a combo of your own." },
  { target: "categories", title: "Shop by category", text: "Browse the categories to find pickles, fresh produce, dairy, snacks, and more." },
  { target: "deals", title: "Discover today’s deals", text: "Explore discounted products here. Use View More Deals to see more, or save favourites with the heart icon." },
  { target: "combos", title: "Create your VIP Combo Pack", text: "Open VIP Combo Packs, choose an offer, and pick your favourite items in the pack’s size and quantity." },
  { title: "Your shopping, in one place", text: "Use your cart to checkout. Your account gives you access to saved addresses, wallet balance, and order history, including downloadable bills." },
  { title: "Ready to explore the site?", text: "You’re all set. Enjoy discovering your next favourite at VIP Foods!" },
];
export default function FirstVisitTour() {
  const [open, setOpen] = useState(() => {
    try { return !localStorage.getItem(STORAGE_KEY); } catch { return true; }
  });
  const [index, setIndex] = useState(0);
  const dialogRef = useRef(null);
  const headingRef = useRef(null);
  const step = steps[index];
  function finish() {
    try { localStorage.setItem(STORAGE_KEY, "done"); } catch { /* Storage may be disabled. */ }
    setOpen(false);
    window.dispatchEvent(new Event("vipfoods:tour-ended"));
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    headingRef.current?.focus({ preventScroll: true });
    const target = step.target && document.querySelector(`[data-tour="${step.target}"]`);
    if (target) {
      target.classList.add("vip-tour-highlight");
      const top = target.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
    }
    return () => target?.classList.remove("vip-tour-highlight");
  }, [open, step]);
  if (!open) return null;
  return <dialog ref={dialogRef} className="vip-tour-dialog" aria-labelledby="vip-tour-title" aria-describedby="vip-tour-description" onCancel={event => { event.preventDefault(); finish(); }}>
    <div className="vip-tour-top"><span>QUICK TOUR · {index + 1} / {steps.length}</span><button type="button" onClick={finish}>End tour ×</button></div>
    <h2 id="vip-tour-title" ref={headingRef} tabIndex={-1}>{step.title}</h2>
    <p id="vip-tour-description">{step.text}</p>
    <div className="vip-tour-progress" aria-hidden="true">{steps.map((_, i) => <span key={i} className={i === index ? "active" : ""} />)}</div>
    <div className="vip-tour-actions"><button type="button" onClick={finish}>Skip tour</button><div>{index > 0 && <button type="button" onClick={() => setIndex(index - 1)}>Back</button>}<button type="button" className="vip-tour-next" onClick={() => index === steps.length - 1 ? finish() : setIndex(index + 1)}>{index === steps.length - 1 ? "Ready to explore" : "Next →"}</button></div></div>
  </dialog>;
}
