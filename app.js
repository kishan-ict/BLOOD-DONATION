(() => {
  const form = document.querySelector("#donorForm");
  const bloodGroupWrap = document.querySelector("#bloodGroupWrap");
  const unknownGroupNote = document.querySelector("#unknownGroupNote");
  const bloodGroup = document.querySelector("#bloodGroup");
  const welcomeEl = document.querySelector("#welcomeModal");
  const welcomeModal = new bootstrap.Modal(welcomeEl);
  const cardModal = new bootstrap.Modal(document.querySelector("#donorCardModal"));
  let submittedDonor = null;

  const closeWelcome = () => {
    welcomeModal.hide();
    try { localStorage.setItem("lifelinkWelcomeSeen", "yes"); } catch {}
  };
  document.querySelectorAll("[data-dismiss-welcome]").forEach(button => button.addEventListener("click", closeWelcome));

  const updateBloodGroup = () => {
    const answer = form.querySelector('input[name="knowsBloodGroup"]:checked')?.value;
    bloodGroupWrap.classList.toggle("d-none", answer !== "yes");
    unknownGroupNote.classList.toggle("d-none", answer !== "no");
    bloodGroup.required = answer === "yes";
    if (answer !== "yes") bloodGroup.value = "";
  };
  form.querySelectorAll('input[name="knowsBloodGroup"]').forEach(input => input.addEventListener("change", updateBloodGroup));

  form.addEventListener("submit", event => {
    event.preventDefault();
    const age = Number(document.querySelector("#age").value);
    if (!form.reportValidity()) return;
    if (!Number.isFinite(age) || age < 18) {
      document.querySelector("#age").setCustomValidity("You must be at least 18 years old to register.");
      document.querySelector("#age").reportValidity();
      document.querySelector("#age").setCustomValidity("");
      return;
    }
    const data = new FormData(form);
    submittedDonor = {
      name: String(data.get("fullName")).trim(),
      phone: String(data.get("phone")).trim(),
      address: String(data.get("address")).trim(),
      age,
      bloodGroup: data.get("knowsBloodGroup") === "yes" ? String(data.get("bloodGroup")) : "Not known — check at donation location"
    };
    if (!submittedDonor.name || !submittedDonor.phone || !submittedDonor.address) return;
    const id = "LL-" + new Date().getFullYear() + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    document.querySelector("#donorCard").innerHTML = `
      <div class="donor-card-head"><span class="donor-card-title">LIFELINK · DONOR INTEREST CARD</span><span class="donor-card-mark">✚</span></div>
      <div class="donor-card-name">${escapeHtml(submittedDonor.name)}</div><div class="donor-card-id">REGISTRATION ID · ${id}</div>
      <div class="donor-card-data"><div><small>Blood group</small><b>${escapeHtml(submittedDonor.bloodGroup)}</b></div><div><small>Age</small><b>${submittedDonor.age}</b></div><div><small>Phone</small><b>${escapeHtml(submittedDonor.phone)}</b></div><div><small>Address / area</small><b>${escapeHtml(submittedDonor.address)}</b></div></div>
      <div class="donor-card-foot">Interest registration only · Donation eligibility confirmed by centre staff</div>`;
    form.reset();
    updateBloodGroup();
    cardModal.show();
  });

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }
  async function cardBlob() {
    const canvas = await html2canvas(document.querySelector("#donorCard"), { scale: 2, backgroundColor: null });
    return new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  }
  document.querySelector("#downloadCard").addEventListener("click", async () => {
    const blob = await cardBlob();
    if (!blob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "lifelink-donor-card.png";
    link.click();
    URL.revokeObjectURL(link.href);
  });
  document.querySelector("#shareCard").addEventListener("click", async () => {
    const blob = await cardBlob();
    if (!blob) return;
    const file = new File([blob], "lifelink-donor-card.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] }) && navigator.share) {
      try { await navigator.share({ title: "My LifeLink donor card", text: "My blood donor interest registration card.", files: [file] }); }
      catch (error) { if (error.name !== "AbortError") console.error(error); }
    } else {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "lifelink-donor-card.png";
      link.click();
      URL.revokeObjectURL(link.href);
      bootstrap.Toast.getOrCreateInstance(document.querySelector("#shareToast")).show();
    }
  });

  try {
    if (!localStorage.getItem("lifelinkWelcomeSeen")) welcomeModal.show();
  } catch { welcomeModal.show(); }
})();