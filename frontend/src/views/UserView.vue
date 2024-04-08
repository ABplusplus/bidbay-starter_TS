<script>
import { useAuthStore } from "../store/auth";

export default {
  data() {
    return {
      status: '',
      products: [],
      bids: [],
      isAuthenticated: null,
      isAdmin: null,
      userData: null,
      token: null,
      sellerId : undefined,
      username: undefined,
      email: undefined,
      admin: false,
      
    };
  },
  async mounted() {
    const authStore = useAuthStore();
    this.isAuthenticated = authStore.isAuthenticated;
    this.isAdmin = authStore.isAdmin;
    this.userData = authStore.userData;
    this.token = authStore.token;
    this.sellerId = this.$route.path === '/users/me' ? this.userData.id : this.$route.params.userId;

  console.log("selerId");
    console.log(this.sellerId);
    await this.fetchData();
  },

  
  methods: {
    getLastBid(product) {
      console.log('getLastBid was called');
      console.log(product);
  if (product.bids && product.bids.length > 0) {
    const sortedBids = product.bids.sort((a, b) => b.price - a.price);
    return sortedBids[0].price;
  }
  return product.originalPrice; 
},
    formatDate(date) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString("fr-FR", options);
    },
    async fetchData() {
  this.status = 'loading'; 
  
  try {
    
    const response = await fetch(`http://localhost:3000/api/users/${this.sellerId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data= await response.json();
    this.userPage = data;
    this.products = data.products;
    this.bids = data.bids;
    this.username = data.username;
    this.email = data.email;
    this.id = data.id;
    this.admin = data.admin;
    this.status = 'success';
    
    
    
    
  } catch (e) {
    this.status = 'error';
    console.error(e);
  }
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
   
 
  
}}
</script>



<template>
  <div>
    <h1 class="text-center" data-test-username>
      Utilisateur {{ this.username || "Chargement" }}
      <span class="badge rounded-pill bg-primary" data-test-admin v-if = "this.admin">Admin</span>
    </h1>
    <div class="text-center" data-test-loading v-if="status == 'loading'">
      <span class="spinner-border"></span>
      <span>Chargement en cours...</span>
    </div>
    <div class="alert alert-danger mt-3" data-test-error v-else-if="status == 'error'">
      Une erreur est survenue
    </div>
    <div data-test-view v-else>
      <div class="row" >
        <div class="col-lg-6">
          <h2>Produits</h2>
          <div class="row">
            <div
              class="col-md-6 mb-6 py-2"
              v-for="product in products"
              :key="product.id"
              data-test-product
            >
              <div class="card">
                <RouterLink
                  :to="{ name: 'Product', params: {productId: product.id} }">
                
                  <img
                    :src = "product.pictureUrl  || 'https://via.placeholder.com/300'"
                    class="card-img-top"
                    data-test-product-picture
                  />
                </RouterLink>
                <div class="card-body">
                  <h5 class="card-title">
                    <RouterLink
                      :to="{
                        name: 'Product',
                        params: { productId: product.id },
                      }"
                      data-test-product-name
                    >
                      {{product.name}}
                    </RouterLink>
                  </h5>
                  <p class="card-text" data-test-product-description>
                    {{product.description}}
                  </p>
                  <p class="card-text" data-test-product-price>
                  {{ product.bids?.length === 0 ? 'Prix de départ ' + product.originalPrice + ' €' : 'Prix actuel ' + getLastBid(product) + ' €' }}
                </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <h2>Offres</h2>
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">Produit</th>
                <th scope="col">Offre</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="bid in this.bids" :key="bid.id" data-test-bid>
                <td>
                  <RouterLink
                    :to="{
                      name: 'Product',
                      params: { productId: bid.product.id },
                    }"
                    data-test-bid-product
                  >
                    {{bid.product.name}}
                  </RouterLink>
                </td>
                <td data-test-bid-price>{{bid.price + ' €'}}</td>
                <td data-test-bid-date>{{ formatDate(bid.date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
