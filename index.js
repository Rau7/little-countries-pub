const express = require("express");
const app = express();
const mongoose = require("mongoose");
const axios = require('axios');
const model = require('./db-model');
const res = require("express/lib/response");
const { send } = require("express/lib/response");

/**
 * FOR ENDPOINT SALESREP (TASK 1)
 * 
 * this function sends region, country name
 *
*/
app.get("/countries", (req, res, next) => {
    //this variable is for query parameter
    var spe_reg = req.query.region;
    //if spe_reg is null we know that no parameters send
    //so return all countries
    if(spe_reg == null){

        var query = model.Countries.find({});
        query.sort('name');
        query.exec(function (err, country) {
            res.json(country);
        })
   
    }
    else{
        //if spe_reg is not null or undefined
        //we get countries based on region
        var query = model.Countries.find({region: spe_reg}).sort('name');

        query.exec(function (err, country) {
            res.json(country);
        })
    }

    

});


/**
 * FOR ENDPOINT SALESREP (TASK 2)
 * 
 * this function sends region, maxSalesRep, minSalesRep
 *
*/
app.get("/salesrep", (req, res, next) => {
    //node-fetch cannot be used because they removed require it only works with import :(

    axios.get("http://localhost:3000/countries").then(response => {
        countries = response.data
        //uniqueRegions assigned with all regions
        var uniqueRegions = countries.map(item => item.region).filter((value, index, self) => self.indexOf(value) === index);
        var salesReqArr = [];
        //for each region we do calculations and fill salesReqArr with them
        var counter = 0;
        uniqueRegions.forEach(element => {
            var data = {};
            axios.get('http://localhost:3000/countries/?region=' + element)
                .then(response => {
                    data["region"] = element;
                    data["maxSalesReq"] = (Math.ceil(response.data.length / 3));
                    data["minSalesReq"] = (Math.ceil(response.data.length / 7));
                    salesReqArr.push(data);
                    counter++;
                    //know we reach at the end of the foreach
                    if(counter == uniqueRegions.length){
                        res.send(salesReqArr);
                    }
                })


        });

    });
    

});

/**
 * FOR BONUS TASK
 * 
 * this function sends optimal solution 
 *
*/
app.get("/optimal", (req, res, next) => {
    //node-fetch cannot be used because they removed require it only works with import :(

    axios.get("http://localhost:3000/countries").then(response => {
        countries = response.data
        //uniqueRegions assigned with all regions
        var uniqueRegions = countries.map(item => item.region).filter((value, index, self) => self.indexOf(value) === index);
        var optimal = [];
        var outerCounter = 0;
        var result = [];
        //for each region array called optimal(our result array) filled with each regions' who gets which country information
        uniqueRegions.forEach(element => {
            fillSalesRep(element).then(data =>{
                outerCounter++;
                optimal.push(data);
                //when foreach process is done send optimal solution
                if(outerCounter == uniqueRegions.length){
                    res.send(optimal);       
                }
            });

            
        });

    });
    

});


/**
 * this function fills the salesRep variable with optimal solution for
 * each region
 * 
 * @param {any} element - represent region (i.e. Europe, MAE)
 *
*/
function fillSalesRep(element){
    //our result array for each region calculation
    var salesRep = [];
    //again we call each region's info
    return axios.get('http://localhost:3000/countries/?region=' + element)
        .then(response => {
            //get country array based on their region
            var cntrs = response.data;
            var countriesOfRegion = cntrs.map(item => item.name).filter((value, index, self) => self.indexOf(value) === index);
            //for minimum member of sales reps
            var maxSalesReq = 7;
            //will be used for array division
            var countryArr = [];
            //our array format will be like this
            var mainArr = {
                region: "",
                countryList: [],
                countryCount: ""
            };
            //this counter is for division, if this counter reaches maxSalesReq we know that a person reaches his/her maximum
            var counter = 0;
            
            for (let i = 0; i < countriesOfRegion.length; i++) {
                countryArr.push(countriesOfRegion[i]);
                counter++;
                //we know we reach maximum
                if(counter == maxSalesReq){
                    mainArr = {
                        region: element,
                        countryList: countryArr,
                        countryCount: counter
                    };
                    salesRep.push(mainArr);
                    //reset counter and array
                    counter = 0;
                    countryArr = [];
                }
                //this is for rest of the countries like if we have 27 countries 7 country goes to 3 people
                //and last 6 countries go to last person here
                if(i == countriesOfRegion.length -1){
                    if(counter != 0){
                        mainArr = {
                            region: element,
                            countryList: countryArr,
                            countryCount: counter
                        };
                        salesRep.push(mainArr);
                    }
                    
                    //return our final array for this region
                    return salesRep;
                } 
            }  
        })
}

const port= process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`You can check countries or specific region on localhost:${port}/countries`);
  console.log(`You can check representative numbers on localhost:${port}/salesrep`);
  console.log(`You can check optimal solution about representatives on localhost:${port}/optimal`);
});