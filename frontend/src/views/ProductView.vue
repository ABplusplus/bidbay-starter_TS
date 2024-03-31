<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../store/auth";

const { isAuthenticated, isAdmin, userData, token } = useAuthStore();

const route = useRoute();
const router = useRouter();

const productId = ref(route.params.productId);
const product = ref(null);
const bidAmount = ref(null);

/**
 * @param {number|string|Date|VarDate} date
 */
function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("fr-FR", options);
}

function formatDateHourMinute(date) {
  const options = { hour: "numeric", minute: "numeric" };
  return new Date(date).toLocaleDateString("fr-FR", options);
}

async function fetchProduct() {
  const response = await fetch(`http://localhost:3000/api/products/${productId.value}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  product.value = await response.json();
}

function countdown(){
  if (!product.value) {
    return '';
  }
  const endDate = new Date(product.value.endDate);
  const now = new Date();
  const diff = endDate - now;
  if (diff <= 0) {
    return 'Terminée';
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${days} jours, ${hours} heures et ${minutes} minutes`;

}

const isBidValid = computed(() => {
  if(product.value?.bids && product.value?.bids.length > 0){
    return bidAmount.value > Math.max(...product.value?.bids.map(bid => bid.price));
  }else{
    return bidAmount.value >= product.value?.originalPrice;
  }

  
});

async function submitBid() {
  console.log('submitBid was called'); 

  if (!isBidValid.value) {
    return;
  }
  const response = await fetch(`http://localhost:3000/api/products/${productId.value}/bids`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.value}`,
    },
    body: JSON.stringify({
      price: bidAmount.value,
      bidderId: userData.value.id,
    }),
  });
  if (response.ok) {
    // The bid was successfully created
    // Reload the product
    
    await fetchProduct();
  } else {
    // There was an error
    // Handle the error
  }
}



onMounted(fetchProduct);
</script>

<template>
  <div class="row">
    <div class="text-center mt-4" data-test-loading>
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div class="alert alert-danger mt-4" role="alert" data-test-error>
      Une erreur est survenue lors du chargement des produits.
    </div>
    <div class="row" data-test-product>
      <!-- Colonne de gauche : image et compte à rebours -->
      <div class="col-lg-4">
        <img
          :src="product?.pictureUrl || 'https://via.placeholder.com/300'"
          alt=""
          class="img-fluid rounded mb-3"
          data-test-product-picture
        />
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">Compte à rebours</h5>
          </div>
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted" data-test-countdown>
              Temps restant : {{ countdown() || 'Chargement...'}}
            </h6>
          </div>
        </div>
      </div>

      <!-- Colonne de droite : informations du produit et formulaire d'enchère -->
      <div class="col-lg-8">
        <div class="row">
          <div class="col-lg-6">
            <h1 class="mb-3" data-test-product-name>
              {{ product?.name || 'Chargement...' }}
              
            </h1>
          </div>
          <div class="col-lg-6 text-end">
            <RouterLink
              :to="{ name: 'ProductEdition', params: { productId: 'TODO' } }"
              class="btn btn-primary"
              data-test-edit-product
              v-if="isAdmin || (isAuthenticated && product?.seller.id === userData.id)"
            >
              Editer
            </RouterLink>
            &nbsp;
            <button class="btn btn-danger" data-test-delete-product
            v-if="isAdmin || (isAuthenticated && product?.seller.id === userData.id)"

            >
              Supprimer
              
            </button>
          </div>
        </div>

        <h2 class="mb-3">Description</h2>
        <p data-test-product-description>
          {{product?.description || 'Chargement...'}}
        </p>

        <h2 class="mb-3">Informations sur l'enchère</h2>
        <ul>
          <li data-test-product-price>Prix de départ : {{product?.originalPrice || "Chargement .."}} €</li>
          <li data-test-product-end-date>Date de fin : {{formatDateHourMinute(product?.endDate)}}</li>
          <li>
            Vendeur :
            <router-link
              :to="{ name: 'User', params: { userId: 'TODO' } }"
              data-test-product-seller
            >
              {{product?.seller.username || 'Chargement...'}}
            </router-link>
          </li>
        </ul>

        <h2 class="mb-3">Offres sur le produit</h2>
        <table class="table table-striped" data-test-bids>
          <thead>
            <tr>
              <th scope="col">Enchérisseur</th>
              <th scope="col">Offre</th>
              <th scope="col">Date</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bid in product?.bids" :key="bid" data-test-bid>
              <td>
                <router-link
                  :to="{ name: 'User', params: { userId: 'TODO' } }"
                  data-test-bid-bidder
                >
                  {{bid.bidder.username}}
                </router-link>
              </td>
              <td data-test-bid-price>{{bid.price}}€</td>
              <td data-test-bid-date>{{ formatDateHourMinute(bid.date)}}</td>
              <td>
                <button class="btn btn-danger btn-sm" data-test-delete-bid
                v-if="isAdmin"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p data-test-no-bids v-if="!product?.bids || product?.bids.length === 0">Aucune offre pour le moment</p>

        <form data-test-bid-form
        v-if="isAuthenticated && product?.seller.id !== userData.id && countdown() !== 'Terminée'"
        @submit.prevent="submitBid">

          <div class="form-group">
            <label for="bidAmount">Votre offre :</label>
            <input
              type="number"
              class="form-control"
              id="bidAmount"
              v-model.number="bidAmount"
              data-test-bid-form-price

            />
            <small class="form-text text-muted">
                Le montant doit être supérieur à {{ product?.bids && product?.bids.length > 0 ? Math.max(...product?.bids.map(bid => bid.price)) : product?.originalPrice || 0 }} €.
            </small>
          </div>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="!isBidValid"
            data-test-submit-bid
          >
            Enchérir
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
