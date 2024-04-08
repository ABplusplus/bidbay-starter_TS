<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "../store/auth";
import { useRoute, useRouter } from "vue-router";

const { isAuthenticated, token } = useAuthStore();
const router = useRouter();
const route = useRoute();

if (!isAuthenticated.value) {
  router.push({ name: "Login" });
}

const productId = ref(route.params.productId);
const productName = ref("");
const productDescription = ref("");
const productCategory = ref("");
const originalPrice = ref("");
const pictureUrl = ref("");
const endDate = ref("");
const error = ref(null);
const isSubmitting = ref(false);

onMounted(async () => {
  try {
    // Make API call to fetch product details
    // Assume the API response is stored in a variable called response
    productName.value = response.data.name;
  
  } catch (err) {
    error.value = "Une erreur s'est produite";
  }
}); 

// Pseudo-code for fetching product details
onMounted(async () => {
  try {
    const response = await fetch(`your-api-endpoint/products/${productId.value}`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch product details');
    const data = await response.json();
    productName.value = data.name;
    productDescription.value = response.data.description;
    productCategory.value = response.data.category;
    originalPrice.value = response.data.originalPrice;
    pictureUrl.value = response.data.pictureUrl;
    endDate.value = response.data.endDate;
  } catch (err) {
    error.value = "Une erreur s'est produite";
  }
});




const editProduct = async () => {
  if (!productName.value || !productDescription.value || !originalPrice.value || !pictureUrl.value || !endDate.value) {
    error.value = "Une erreur s'est produite";
    return;
  }

  isSubmitting.value = true;

  try {
    // Make API call to update product
    // Reset the error
    error.value = null;
  } catch (err) {
    error.value = "Une erreur s'est produite";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <h1 class="text-center">Modifier un produit</h1>

  <div class="row justify-content-center">
    <div class="col-md-6">
      <form @submit.prevent="editProduct">
        <div v-if="error" class="alert alert-danger mt-4" role="alert" data-test-error>
          {{ error }}
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
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting"
            data-test-submit
          >
            Modifier le produit
            <span
              v-if="isSubmitting"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
              data-test-spinner
            ></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
