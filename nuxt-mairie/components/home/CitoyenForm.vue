<script setup lang="ts">
const form = reactive({ nom: '', prenom: '', tel: '' })
const submitted = ref(false)

const submit = async () => {
  // TODO: connecter à l'API admin
  submitted.value = true
  setTimeout(() => { submitted.value = false; Object.assign(form, { nom: '', prenom: '', tel: '' }) }, 3000)
}
</script>

<template>
  <div class="reg-form-wrap">
      <p class="block-label">Espace citoyen</p>
      <p class="reg-subtitle">Enregistrez-vous pour accéder aux services en ligne</p>

      <Transition name="fade-tab" mode="out-in">
        <div v-if="submitted" class="reg-success">
          <i class="bi bi-check-circle-fill" /> Inscription enregistrée !
        </div>
        <form v-else class="reg-form" @submit.prevent="submit">
          <div class="reg-field">
            <label class="reg-label" for="reg-nom"><i class="bi bi-person-fill" /> Nom</label>
            <input id="reg-nom" v-model="form.nom" type="text" class="reg-input" placeholder="Votre nom" required />
          </div>
          <div class="reg-field">
            <label class="reg-label" for="reg-prenom"><i class="bi bi-person" /> Prénom</label>
            <input id="reg-prenom" v-model="form.prenom" type="text" class="reg-input" placeholder="Votre prénom" required />
          </div>
          <div class="reg-field">
            <label class="reg-label" for="reg-tel"><i class="bi bi-telephone-fill" /> Numéro</label>
            <input id="reg-tel" v-model="form.tel" type="tel" class="reg-input" placeholder="+225 00 00 00 00" required />
          </div>
          <button type="submit" class="reg-btn">
            <i class="bi bi-send-fill" /> S'enregistrer
          </button>
        </form>
      </Transition>
  </div>
</template>

<style scoped>
.reg-form-wrap { padding: 32px 0 32px 24px; }
.block-label {
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.16em; color: #009640; margin-bottom: 20px;
}
.reg-subtitle { font-size: 0.8rem; color: #777; margin: -8px 0 24px; line-height: 1.5; }
.reg-form { display: flex; flex-direction: column; gap: 16px; }
.reg-field { display: flex; flex-direction: column; gap: 6px; }
.reg-label {
  font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: #0D0D0D;
  display: flex; align-items: center; gap: 6px;
}
.reg-label i { color: #E65100; }
.reg-input {
  width: 100%; padding: 10px 14px; border: 1px solid #EBEBEB;
  border-radius: 0; font-size: 0.88rem; color: #0D0D0D;
  background: #F7F7F5; outline: none; transition: border-color 0.2s;
}
.reg-input:focus { border-color: #009640; background: white; }
.reg-input::placeholder { color: #bbb; }
.reg-btn {
  margin-top: 8px; padding: 12px 20px; background: #009640; color: white;
  border: none; font-size: 0.8rem; font-weight: 900; text-transform: uppercase;
  letter-spacing: 0.08em; cursor: pointer; display: flex; align-items: center;
  justify-content: center; gap: 8px; transition: background 0.2s;
}
.reg-btn:hover { background: #007a32; }
.reg-success {
  display: flex; align-items: center; gap: 10px;
  background: #e8f5e9; color: #2e7d32;
  padding: 20px; border-radius: 8px;
  font-weight: 700; font-size: 0.9rem;
}
.fade-tab-enter-active, .fade-tab-leave-active { transition: opacity 0.25s, transform 0.25s; }
.fade-tab-enter-from, .fade-tab-leave-to { opacity: 0; transform: translateY(6px); }
</style>
