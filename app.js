(() => {
  const form = document.querySelector("#donorForm");
  const bloodGroupWrap = document.querySelector("#bloodGroupWrap");
  const unknownGroupNote = document.querySelector("#unknownGroupNote");
  const bloodGroup = document.querySelector("#bloodGroup");
  const welcomeEl = document.querySelector("#welcomeModal");
  const welcomeModal = new bootstrap.Modal(welcomeEl);
  const cardModal = new bootstrap.Modal(document.querySelector("#donorCardModal"));
  let submittedDonor = null;

  const adminLink = document.querySelector("#adminLink");
  const appScriptEndpoint = window.LIFELINK_CONFIG?.googleSheetsEndpoint?.trim();
  if (adminLink && appScriptEndpoint) {
    adminLink.href = "admin.html";
    adminLink.classList.remove("d-none");
  }

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

  form.addEventListener("submit", async event => {
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
      knowsBloodGroup: data.get("knowsBloodGroup") === "yes",
      bloodGroup: data.get("knowsBloodGroup") === "yes" ? String(data.get("bloodGroup")) : "Not known — check at donation location",
      consent: document.querySelector("#consent").checked
    };
    if (!submittedDonor.name || !submittedDonor.phone || !submittedDonor.address) return;

    const id = "LL-" + new Date().getFullYear() + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    const status = document.querySelector("#sheetStatus");
    submitButton.disabled = true;
    submitButton.textContent = "Sending registration…";
    status.className = "alert alert-warning mt-3 mb-0";
    status.textContent = "Sending your registration to the project sheet…";

    const endpoint = window.LIFELINK_CONFIG?.googleSheetsEndpoint?.trim();
    let statusMessage;
    if (!endpoint) {
      statusMessage = "Not saved: the Google Sheets endpoint is not configured yet. This card is for demonstration only.";
    } else {
      try {
        await fetch(endpoint, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            registrationId: id,
            name: submittedDonor.name,
            phone: submittedDonor.phone,
            address: submittedDonor.address,
            age: submittedDonor.age,
            knowsBloodGroup: submittedDonor.knowsBloodGroup,
            bloodGroup: submittedDonor.knowsBloodGroup ? submittedDonor.bloodGroup.replace("−", "-") : "",
            consent: submittedDonor.consent,
            website: String(data.get("website") || "")
          })
        });
        statusMessage = "Request sent to the Google endpoint. This browser cannot confirm that the row was saved, so check the Sheet before relying on the registration.";
      } catch (error) {
        console.error("LifeLink Sheets submission failed:", error);
        statusMessage = "Could not reach Google Sheets. Your registration was not confirmed; please try again later.";
      }
    }

    document.querySelector("#donorCard").innerHTML = `
      <div class="donor-card-head"><span class="donor-card-title">LIFELINK · DONOR INTEREST CARD</span><span class="donor-card-mark">✚</span></div>
      <div class="donor-card-name">${escapeHtml(submittedDonor.name)}</div><div class="donor-card-id">REGISTRATION ID · ${id}</div>
      <div class="donor-card-data"><div><small>Blood group</small><b>${escapeHtml(submittedDonor.bloodGroup)}</b></div><div><small>Age</small><b>${submittedDonor.age}</b></div><div><small>Phone</small><b>${escapeHtml(submittedDonor.phone)}</b></div><div><small>Address / area</small><b>${escapeHtml(submittedDonor.address)}</b></div></div>
      <div class="donor-card-foot">Interest registration only · Eligibility confirmed by centre staff</div>`;
    status.textContent = statusMessage;
    form.reset();
    updateBloodGroup();
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
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