<template>
  <div>
    <div class="buy-cont-warp">
      <div class="buy-center-warp">
        <ttms-buybar></ttms-buybar>
        <div class="buy-ticket-warp">
          <div v-if="(!filmInfoFlag)&&(!seatFlag)">
            <ttms-loading></ttms-loading>
          </div>
          <div v-else class="buy-center">
            <div class="left-Seat-show">
              <!--:seatArray="seatArray"-->
              <ttms-seat v-if="this.seatFlag" @selectedTicket="selectTicketCallback" :seatArray="seatArray" ></ttms-seat>
            </div>
            <div class="right-info-buy" v-if="seatFlag&&filmInfoFlag">
              <div class="sessionInfo">
                <div class="leftPicInfo" v-if="filmInfoFlag">
                  <img :src="filmInfo.poster">
                </div>
                <div class="rightInfo">
                  <p>
                  <h3>{{filmInfo.showName}}</h3>
                  </p>
                  <p>{{filmInfo.language}}</p>
                  <p>{{filmInfo.duration}}分钟</p>
                </div>
              </div>
              <p class="filmInfo-p">影院：<span>格瓦拉影城</span></p>
              <p class="filmInfo-p">影厅：<span>{{otherInfo.studio.name}}</span></p>
              <p>场次:<span style="color:rgba(80,191,255,1)">{{otherInfo.startTime.month}}月{{otherInfo.startTime.day}}日{{otherInfo.startTime.hours}}:{{otherInfo.startTime.minutes}}</span></p>
              <div class="slectedSeat">
                <div class="select-seat-info" v-if="selectedTicketList.length==0">
                  <p>你还<span style="color:red">未选择</span>座位</p>
                  <p>点击<span style="color: red">左侧座位图</span>选择座位，再次点击取消</p>
                </div>
                <ul v-for="item in selectedTicketList">
                  <li>{{item.inFactRow}}排{{item.inFactCol}}列</li>
                </ul>
              </div>
              <hr/>
              <div class="priceInfo">
                <p>单价：{{otherInfo.price}}✖{{selectedTicketList.length}}</p>
                <p>共计：{{otherInfo.price*selectedTicketList.length}}</p>
              </div>
              <hr/>
              <div class="buyInfo">
                <p>收到电子码的手机号</p>
                <w-input width="15rem" label="Phone" check="phone" v-model="phone"></w-input>
              </div>
              <div class="submitBtn" @click="lockSeatAjax">
                  <w-button type="info" >确认信息，下单</w-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ttms-footer></ttms-footer>
  </div>
</template>
<script>
  import axios from 'axios';
  export default {
    name: 'buyTickets',
    data(){
      return{
        seatArray:[],
        selectedTicketList:[],
        rowAndCol:[],
        seatFlag:false,
        filmInfoFlag:false,
        filmInfo:{},
        otherInfo:{},
        phone:""
      }
    },
    created:function(){
      this.getScheduleInfo();
      this.getFilmInfo();
      console.log(this.$route.params.sid,this.$route.params.pid);
    },
    methods: {
      selectTicketCallback(ticketsList) {
        this.selectedTicketList = ticketsList;
      },
      getColAndRow:function(){
        for(let i=0;i<this.selectedTicketList.length;i++){
          let item = [];
          item[0] = this.selectedTicketList[i].row;
          item[1] = this.selectedTicketList[i].col;
          this.rowAndCol.push(item);
        }
      },
      getFilmInfo: function () {
        axios.get("http://119.27.174.87:8080/ttms2.0/playServlet?method=showAll")
          .then(res => {
            let allFilmInfo = res.data;
            allFilmInfo.forEach(function (item) {
              if (item.pid == this.$route.params.pid) {
                this.filmInfoFlag = true;
                this.filmInfo = item;
              }
            }.bind(this));
          })
          .catch(err => {
            console.log(err);
          });
      },
      getScheduleInfo: function () {
        let vm = this;
        $.ajax({
          type: "GET",
          url: "http://119.27.174.87:8080/ttms2.0/scheduleServlet",
          data:{
            "method":"selectScheduleById",
            "sid":this.$route.params.sid
          },
          xhrFields: {
            withCredentials: true
          },
          crossDomain: true,
          success: function (res) {
            let json = JSON.parse(res);
            if (json.error) {
              this.$router.push({path:'/login'});
            } else {
              vm.seatArray = json.seatArray;
              vm.seatFlag = true;
              vm.otherInfo = json;
              vm.phone = json.phoneNumber;
            }
          }.bind(this),
          error: function () {
            alert("通信错误！");
          }
        })
      },
      lockSeatAjax: function () {
        this.getColAndRow();
        if(this.rowAndCol.length==0){
          alert("座位不能为空！");
        }else{
          $.ajax({
            type: "GET",
            dataType:"json",
            url: "http://119.27.174.87:8080/ttms2.0/saleServlet",
            data: {
              "method": "addSaleItem",
              "seatList":this.rowAndCol,
              "scheduleid":this.$route.params.sid
            },
            xhrFields: {
              withCredentials: true
            },
            crossDomain: true,
            success: function (res) {
              let indentInfo = JSON.stringify(res);
              localStorage.setItem("indent",indentInfo);
              alert("正在锁座，你将有十分钟的支付时间");
              this.$router.push({path:'/pay'});
            }.bind(this),
            error: function (err) {
              alert("错误！");
            },
            traditional:true
          })
        }

      }
    }
  }
</script>
<style>
  .buy-cont-warp{
    width:100%;
    height:690px;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  .buy-center-warp{
    width: 990px;
    margin: 10px 0;
    height:670px;
  }
  .buy-center{
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .buy-ticket-warp{
    width: 100%;
    height:610px;
    margin-top: 10px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    border: 1px solid #ccc;
  }
  .right-info-buy{
    width: 280px;
    height: 100%;
    border-left: 1px solid #ccc;
    background-color: rgba(80,191,255,0.1);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 0 15px;
  }
  .right-info-buy hr{
    width: 290px;
    border: 1px dashed rgba(80,191,255,1);
  }
  .right-info-buy p{
    line-height: 2rem;
  }
  .sessionInfo{
    width: 100%;
    height:160px;
    display: flex;
    margin: 1rem 0.5rem;
    flex-direction: row;
    justify-content: flex-start;
  }
  .leftPicInfo{
    height:100%;
    width: auto;
  }
  .leftPicInfo img{
    height: 100%;
    width: auto;
  }
  .rightInfo{
    margin-left: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }
  .rightInfo p{
    line-height: 2rem;
    font-size: 0.8rem;
  }
  .slectedSeat{
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    flex-wrap: wrap;
    min-height:80px;
  }
  .slectedSeat li{
    height:1rem;
    line-height: 1rem;
    background-color: rgba(80,191,255,1);
    color: white;
    border-radius: 0.3rem;
    margin: 0.5rem 1rem;
    padding: 0.5rem 0.3rem;
  }
  .select-seat-info{
    text-align: left;
  }
  .select-seat-info:first-child{
    color:rgba(80,191,255,1);
  }
  .left-Seat-show{
    width: 680px;
    height:610px;
  }
  .priceInfo{
    text-align: left;
  }
  .submitBtn{
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items:center ;
  }
</style>
