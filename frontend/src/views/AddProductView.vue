<script>
import { ref } from "vue";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "vue-router";

export default {
  setup() {
    const { isAuthenticated, token } = useAuthStore();
    const router = useRouter();
    const productName = ref("");
    const productDescription = ref("");
    const productCategory = ref("");
    const originalPrice = ref("");
    const pictureUrl = ref("");
    const endDate = ref("");
    const error = ref(null);

    if (!isAuthenticated.value) {
      router.push({ name: "Login" });
    }

    const isSubmitting = ref(false);

    const addProduct = async () => {
      if (!productName.value || !productDescription.value || !originalPrice.value || !pictureUrl.value || !endDate.value) {
        error.value = "All fields are required";
        return;
      }

      isSubmitting.value = true;

      try {
        // Make API call to add product
        // Reset the form and error
        productName.value = "";
        productDescription.value = "";
        originalPrice.value = "";
        pictureUrl.value = "";
        endDate.value = "";
        error.value = null;
      } catch (err) {
        error.value = "Une erreur s'est produite";
      } finally {
        isSubmitting.value = false;
      }
    };

    return { productName, productDescription, originalPrice, pictureUrl, endDate, error, addProduct, isSubmitting };

  },
};
</script>

<template>
  <h1 class="text-center">Ajouter un produit</h1>

  <div class="row justify-content-center">
    <div class="col-md-6">
      <form @submit.prevent="addProduct">
        <div v-if="error" class="alert alert-danger mt-4" role="alert" data-test-error>
          {{ error }}
        </div>

        <div class="mb-3">
          <label for="product-name" class="form-label"> Nom du produit </label>
          <input
            v-model="productName"
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
            v-model="productDescription"
            class="form-control"
            id="product-description"
            name="description"
            rows="3"
            required
          ></textarea>
        </div>

        <div class="mb-3">
          <label for="product-category" class="form-label"> 
            Catégorie 
          </label>
          <input
            v-model="productCategory"
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
          <input
            v-model="originalPrice"
            type="number"
            class="form-control"
            id="product-original-price"
            name="originalPrice"
            step="1"
            min="0"
            required
            data-test-product-price
          />
        </div>

        <div class="mb-3">
          <label for="product-picture-url" class="form-label">
            URL de l'image
          </label>
          <input
            v-model="pictureUrl"
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
            v-model="endDate"
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
            Ajouter le produit
            <span
              v-if="isSubmitting"
              data-test-spinner
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 