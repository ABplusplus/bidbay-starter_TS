<script>
import { useAuthStore } from "../store/auth";

export default {
  data() {
    return {
      productId: this.$route.params.productId,
      product: null,
      bidAmount: null,
      status: 'loading',
      isAuthenticated: null,
      isAdmin: null,
      userData: null,
      token: null,
      countdownText: '',
      countdownInterval: null,
    };
  },
  computed: {
    isBidValid() {
      if(this.product?.bids && this.product?.bids.length > 0){
        return this.bidAmount > Math.max(...this.product?.bids.map(bid => bid.price));
      }else{
        return this.bidAmount >= this.product?.originalPrice;
      }
    }
  },
  methods: {
    formatDate(date) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString("fr-FR", options);
    },
    formatDateHourMinute(date) {
      const options = { hour: "numeric", minute: "numeric" };
      return new Date(date).toLocaleDateString("fr-FR", options);
    },
    async fetchProduct() {
      this.status = 'loading';

      try {
        const response = await fetch(`http://localhost:3000/api/products/${this.productId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        this.product = await response.json();
        console.log(this.product);
        console.log(this.product.id);
        if (this.product.id === undefined) {
          throw new Error('Product not found');
        }
        if(this.product.bids && this.product.bids.length > 0){
          this.bidAmount = Math.max(...this.product.bids.map(bid => bid.price)) + 1;
        } else {
          this.bidAmount = this.product.originalPrice;
        }
        this.status = 'ready';
        console.log("Product fetched");
        
      } catch (e) {
        this.status = 'error';
        console.log(e);
      }
    },
    updateCountdown() {
      if (!this.product) {
        return;
      }
      const endDate = new Date(this.product.endDate);
      const now = new Date();
      const distance = endDate - now;

      if (distance < 0) {
        clearInterval(this.countdownInterval);
        this.countdownText = 'Terminée';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      this.countdownText = `${days}j ${hours}h ${minutes}min ${seconds}s`;
    },
    async deleteBid(bidId) {
      console.log('deleteBid was called');
      const response = await fetch(`http://localhost:3000/api/bids/${bidId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });
      if (response.ok) {
        console.log('deleteBid successful');
        await this.fetchProduct();
      } else {
        console.log('deleteBid failed');
      }
    },
    async deleteProduct() {
      const confirmation = window.confirm('Are you sure you want to delete this product?');
      if (confirmation) {
        try {
          console.log('deleteProduct was called');
          console.log(this.productId);
          const response = await fetch(`http://localhost:3000/api/products/${this.productId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.token}`,
            },
          });
          if (response.ok) {
            this.$router.push('/');
          } else {
            console.log('Error deleting product');
          }
        } catch (error) {
          console.log(error);
        }
      }
    },
    async submitBid() {
      console.log('submitBid was called'); 

      if (!this.isBidValid) {
        return;
      }
      const response = await fetch(`http://localhost:3000/api/products/${this.productId}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          price: this.bidAmount,
          bidderId: this.userData.id,
        }),
      });
      if (response.ok) {
        await this.fetchProduct();
      } else {
        console.log('Error submitting bid');
      }
    },
  },
  mounted() {
    this.fetchProduct();
    const authStore = useAuthStore();
    this.isAuthenticated = authStore.isAuthenticated;
    this.isAdmin = authStore.isAdmin;
    this.userData = authStore.userData;
    this.token = authStore.token;
    this.updateCountdown(); 
    this.countdownInterval = setInterval(this.updateCountdown, 1000); 
  
  },
  beforeDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval); 
    }
  },
};
</script>




<template>
  <div class="row">
    <div class="text-center mt-4" data-test-loading v-if="status === 'loading' ">
      <div class="spinner-border" role="status" >
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div class="alert alert-danger mt-4" role="alert" data-test-error v-else-if="status === 'error'">
      Une erreur est survenue lors du chargement des produits.
    </div>
    <div class="row" data-test-product v-else>
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
              {{ countdownText }}
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
              :to="{ name: 'ProductEdition', params: { productId: productId } }"
              class="btn btn-primary"
              data-test-edit-product
              v-if="isAdmin || (isAuthenticated && product?.seller.id === userData.id)"
            >
              Editer
            </RouterLink>
            &nbsp;
            <button class="btn btn-danger" data-test-delete-product
            v-if="isAdmin || (isAuthenticated && product?.seller.id === userData.id)"
            @click="deleteProduct">
            
            
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
          <li data-test-product-end-date>Date de fin : {{formatDate(product?.endDate)}}</li>
          <li>
            Vendeur :
            <router-link
              :to="{ name: 'User', params: { userId: product?.sellerId || 'Chargement'  } }"
              data-test-product-seller
            >
              {{product?.seller?.username || 'Chargement...'}}
            </router-link>
          </li>
        </ul>

        <h2 class="mb-3">Offres sur le produit</h2>
        <table class="table table-striped" data-test-bids v-if="product?.bids && product.bids.length > 0" >
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
                  :to="{ name: 'User', params: { userId: bid.bidderId } }"
                  data-test-bid-bidder
                >
                  {{bid.bidder.username}}
                </router-link>
              </td>
              <td data-test-bid-price>{{bid.price+' '}}€</td>
              <td data-test-bid-date>{{ formatDate(bid.date)}}</td>
              <td>
                <button class="btn btn-danger btn-sm" data-test-delete-bid
                v-if="isAdmin || (isAuthenticated && bid.bidder.id === userData?.id)"
                @click="deleteBid(bid.id)"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p data-test-no-bids v-if="!product?.bids || product?.bids.length === 0">Aucune offre pour le moment</p>

        <form data-test-bid-form
        v-if="isAuthenticated && product?.seller.id !== userData.id && countdownText !== 'Terminée'"
        @submit.prevent="submitBid">

          <div class="form-group">
            <label for="bidAmount">Votre offre :</label>
            <input
              type="number"
              class="form-control"
              id="bidAmount"
              v-model.number="bidAmount"
              :min="product?.bids && product?.bids.length > 0 ? Math.max(...product?.bids.map(bid => bid.price))+1 : product?.originalPrice || 0"
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
