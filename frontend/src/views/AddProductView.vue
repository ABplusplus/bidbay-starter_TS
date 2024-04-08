 
<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';
import { post } from './product';


const { isAuthenticated, token } = useAuthStore();
const router = useRouter();


const productName = ref('');
const productDescription = ref('');
const productCategory = ref('');
const originalPrice = ref('');
const pictureUrl = ref('');
const endDate = ref('');


async function AddProduct() {
  if (!productName.value || !productDescription.value || !productCategory.value || !originalPrice.value || !pictureUrl.value || !endDate.value) {
    return;
  }

  try {
    await post({
      name: productName.value,
      description: productDescription.value,
      category: productCategory.value,
      originalPrice: originalPrice.value,
      pictureUrl: pictureUrl.value,
      endDate: endDate.value,
    });
    router.push({ name: 'Home' });
  } catch (err) {
    console.error(err);
  }
}

const post = async () => {
  if (!productName.value || !productDescription.value || !originalPrice.value || !pictureUrl.value || !endDate.value|| !productCategory.value) {
    error.value = "Une erreur s'est produite";
    return;
  }


const isSubmitting = ref(false);

const error = ref(null);


if (!isAuthenticated.value) {
  router.push({ name: 'Login' });
}



  const submitProduct = async () => {
  try {
    await post({
      name: productName.value,
      description: productDescription.value,
      category: productCategory.value,
      originalPrice: originalPrice.value,
      pictureUrl: pictureUrl.value,
      endDate: endDate.value,
    });
  } catch (err) {
    error.value = "Une erreur s'est produite";
  }
};

};
</script>


<template>
  <h1 class="text-center">Ajouter un produit</h1>

  <div class="row justify-content-center">
    <div class="col-md-6">
      <form @submit.prevent="post" method="post">
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
            class="form-control"
            id="product-description"
            name="description"
            rows="3"
            required
            data-test-product-description
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
            ></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 

