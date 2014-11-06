var assert = require("chai").assert;
var diseaseVis = require("../");

// you can find more docu about mocha here
// https://visionmedia.github.io/mocha/

describe('diseaseVisInspector', function(){
  // do any init stuff here
  beforeEach(function(){
  });
  describe('load', function(){
    it('should return match with default object', function(){
      dummyObj = [{name: "20", homo: 2, hetero: 1, del: 0},
                  {name: "21", homo: 1, hetero: 1, del: 1}, 
                  {name: "22", homo: 1, hetero: 1, del: 0 }];
      assert.deepEqual(diseaseVis('P51587'), dummyObj);
    });
  });
});
