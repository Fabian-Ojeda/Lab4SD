const socket = io("http://192.168.100.14:3000/");

Vue.component("todo-item", {
  props: ["todo"],
  template: "<li>{{todo}}</li>",
});

new Vue({
  el: "#app",
  data() {
    return {
      data: null,
      loading: true,
      errored: false
    };
  },
  mounted() {
    try {
      socket.on("data", (msg) => {
        console.log((this.data = msg));
      });
    } catch (error) {
      console.log(error)
        this.errored = true
    } finally {
      this.loading = false
    }
  },
});

function clock(){
  axios.post('http://localhost:3000/clock')
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
  });  
}