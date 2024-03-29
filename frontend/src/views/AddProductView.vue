<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useAuthStore } from "../store/auth";
import { useRouter } from "vue-router";

const { isAuthenticated, token } = useAuthStore();
const router = useRouter();

if (!isAuthenticated.value) {
  router.push({ name: "Login" });
}

const form = reactive({
  name: '',
  description: '',
  category: '',
  originalPrice: 0,
  pictureUrl: '',
  endDate: '',
});

const isSubmitting = ref(false);
const showError = ref(false);
const errorMessage = ref('');

const validateForm = () => {
  console.log(form.name);
  console.log(form.description);
  console.log(form.category);
  console.log(form.originalPrice);
  console.log(form.pictureUrl);
  console.log(form.endDate);
  if (!form.name || !form.description || !form.category || form.originalPrice <= 0 || !form.pictureUrl || !form.endDate) {
    
    errorMessage.value = 'All fields are required and must be valid.';
    showError.value = true;
    return false;
  }
  showError.value = false;
  return true;
};

const addProduct = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.value}`
    },
    body: JSON.stringify(form)
  };

  try {
    const response = await fetch('/api/products', requestOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "An error occurred while adding the product.");
    }
    isSubmitting.value = false;
    router.push({ name: "Product", params: { productId: data.id } });
  } catch (error) {
  const message = (error instanceof Error) ? error.message : 'An unexpected error occurred.';
  errorMessage.value = message;
  showError.value = true;
  isSubmitting.value = false;
  }
};

watch(form, () => {
  if (showError.value) {
    showError.value = false;
  }
});
</script>

<template>
  <h1 class="text-center">Ajouter un produit</h1>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <form @submit.prevent="addProduct">
        <div v-if="showError" class="alert alert-danger mt-4" role="alert">
          {{ errorMessage }}
        </div>
        <div class="mb-3">
          <label for="product-name" class="form-label"> Nom du produit </label>
          <input
            type="text"
            class="form-control"
            id="product-name"
            required
            data-test-product-name
          />
        </div>

        <div class="mb-3">
          <label for="product-description" class="form-label">
            Description
          </label>
          <textarea
            class="form-control"
            id="product-description"
            name="description"
            rows="3"
            required
            data-test-product-description
          ></textarea>
        </div>

        <div class="mb-3">
          <label for="product-category" class="form-label"> Catégorie </label>
          <input
            type="text"
            class="form-control"
            id="product-category"
            required
            data-test-product-category
          />
        </div>

        <div class="mb-3">
          <label for="product-original-price" class="form-label">
            Prix de départ
          </label>
          <div class="input-group">
            <input
              type="number"
              class="form-control"
              id="product-original-price"
              name="originalPrice"
              step="1"
              min="0"
              required
              data-test-product-price
            />
            <span class="input-group-text">€</span>
          </div>
        </div>

        <div class="mb-3">
          <label for="product-picture-url" class="form-label">
            URL de l'image
          </label>
          <input
            type="url"
            class="form-control"
            id="product-picture-url"
            name="pictureUrl"
            required
            data-test-product-picture
          />
        </div>

        <div class="mb-3">
          <label for="product-end-date" class="form-label">
            Date de fin de l'enchère
          </label>
          <input
            type="date"
            class="form-control"
            id="product-end-date"
            name="endDate"
            required
            data-test-product-end-date
          />
        </div>

        <div class="d-grid gap-2">
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            Ajouter le produit
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
