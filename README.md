# Relax.js - Possibly the last time I ever need to build a parallax library.

Parallax has been my nemesis for a couple of years. Working out how to build for different use cases I've come across. Hopefully this covers most of the uses which people hit. 

This is the first bit of code I've fully open sourced. Let me know if you need any help with it!

Built using VanillaJS and 0 dependencies!

## Usage
It's ridiculously easy! 

1. Include the code on your page
2. Add an element with a class or id and add child divs with a class of "scene"
3. Add some children to the scene elements. If you want to just modify the speed, give them a `data-speed` attribute
4. Alternatively if you want to add a full timeline, reference a json object using the `data-timeline` attribute
5. Call it using the following syntax `var P = new Parallax('.parallax');` 
6. ENJOY!

## JSON Object code reference
It's easy to create complex animations for your elements by using JSON objects. Here's an example:

```javascript

    var test3dTimeline = {
        0 : {
            "opacity": 0,
            "scale3d":[1,1,1]
        },
        50 : {
            "opacity": 1,
            "scale3d":[1,1,1]
        },
        100 : {
            "opacity": 0,
            "scale3d":[0.8,0.8,1]
        }
    }

```