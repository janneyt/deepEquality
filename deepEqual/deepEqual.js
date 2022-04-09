// Author: Ted Janney
// Date: 6/4/2022
// Description: Deep Equality test for objects and primitives in Javascript as a 
//  middle ground between strict equality and the == operator. Checks order and position
//  in objects and arrays.

'use strict';
// Don't add or change anything above this comment.

/*
* Don't change the declaration of this function.
*/
function deepEqual(val1, val2) {

    /*
    Primary driver function for deep equality test. In a real programming language,
    this would be the public function. It sorts out the low-hanging fruit like strict
    equality and primitives. Then, it splits processing between objects and arrays,
    allowing objects to be nested while arrays are processed first as values and then
    nesting is considered in a separate function.
    */
    // Go for the easy, obvious low hanging fruit
    if(val1 === val2){
        return true;
    }

    // Two primitives that are strictly equal are deep equal
    if(isPrimitive(val1) && isPrimitive(val2)){
        return (val1 === val2);
    };

    // If one value is primitive and another is an object, then not deep equal
    if((isPrimitive(val1) && typeof(val2) == 'object') || (isPrimitive(val2) && typeof(val1) == 'object')){
        return false;
    };

    // All of the "both values are objects" cases
    if(isObject(val1) && isObject(val2)){

        // Arrays and other object types are not compatible
        if(Array.isArray(val1) != Array.isArray(val2)){
            return false;
        } else if (Array.isArray(val1) == false && Array.isArray(val1) == false){
            // nestedObj hands all object types including level 1 nesting
            return nestedObj(val1, val2);
        };
        // Test the properties against each other for both val1 and val2
        // testKeys also handles nested arrays
        return testKeys(val1, val2);
    };
}

// Nested objects helper function

let nestedObj = (testObj1, testObj2) => {

    /*
    Iterates over nested objects (unnested objects just have level 1 nesting)

    The recursion actualy occurs *within* a for loop. This was the breakthrough for me.
    The for loop iterates over the original object (or subsequent objects passed to recursion)
    The recursion handles the nesting within the object.
    */
    
    if (isObject(testObj1) && isObject(testObj2)) {

        // Javascript allows you to reduce an object with key-value pairs to arrays
        // Sort is necessary to trick Javascript into recognizing that deep equal is regardless of order of properties.
        const entries1 = Object.entries(testObj1).sort();  
        const entries2 = Object.entries(testObj2).sort();

        // Different length objects are not deep equal
        if(entries1.length !== entries2.length){
            return false;
        }

        // This is the strange iterative loop required to find nesting objects (which are the subject of the recursion)
        for (let i = 0; i < entries1.length; i ++) {

            // Key value pairs need to be compared
            const [objectKey1, objectValue1] = entries1[i];
            const [objectKey2, objectValue2] = entries2[i];

            // Base case(s): When both object keys are null, we can conclude that the objects
            // are deep equal
            if (objectKey1 === null && objectKey2 === null) {
                return true;
            } else if (objectKey1 === null || objectKey2 === null) {  
                
                // If the current object's key is null, we've reached the end of the object
                // Note: this is null, NOT 'undefined'. Because of course it is.
                return false;
            }
    
            // The recursion is required if BOTH next elements are objects
            // The ordering doesn't matter due to the sort function for the entries assignment
            if (isObject(objectValue1) && isObject(objectValue2)) {

                return nestedObj(objectValue1, objectValue2);
                
            } else if(isObject(objectValue1) || isObject(objectValue2)){
                // If in the course of human events, it becomes obvious that
                // one element is an object and the other is not, it must be rejected
                return false;
            } else if(!isObject(objectValue1) && !isObject(objectValue2)){
                // In this case, the next value is not an object, so we don't 
                // need recursion on objects, but rather to use the testKeys to make sure
                // that the objects are still consistent. Note it's the objects, not the entries.
                // This *should* be picked up earlier as a general rule but in case there's some hideous
                // nested array inside of a nested object eldritch abomination from the very bowels of hell,
                // we have this test.
                return testKeys(testObj1, testObj2);
            };
        };
    
    };
};

const isObject = (value) => {

    // Double exclamation converts from truthy to true and vice vera
    return !!(value && typeof value === "object");
};

// Helper function to find whether keys match
let testKeys = (val1, val2) => {
    /*
    Tests the key-value pairs of an object for deep equality. This is meant to handle
    mostly arrays or one-dimensional object elements. Do not use for nested objects, but
    it an handled nested arrays. Probably best referred to as occasionally recursive.
    */

    // ORDER DOES NOT MATTER. So like in the nestedObj function, we must first sort
    const val1Keys = Object.keys(val1).sort();
    const val2Keys = Object.keys(val2).sort();

    // Knock out objects with more keys than each other
    if(val1Keys.length !== val2Keys.length){
        return false;
    } 


    // Compares keys, values and types of values to keep only those that match
    // Key comparison is implicit
    // 'of' is required instead of 'in' because we care about the key-value pair and
    // not the index of the key.
    for(let key of val1Keys){
        if(val1[key] != val2[key]){

            // Even if the keys differ, we still have to test if they're nested arrays
            // And thus pass them to the sorting function and redo testKeys
            // Is this recursion? Yes...but the base case is implicit in the comparison
            // above in the if clause
            if(Array.isArray(val1[key]) && Array.isArray(val2[key])){
                return testKeys(val1[key],val2[key]);
            }

            // Not an array? Discard.
            return false;
        } else if (typeof(val1[key])!= typeof(val2[key])){

            // If the types are different in the elements, discard even if the values
            // are similar.
            return false;
        }
    };

    // Lost on what this is sorting out? Basically, if you can't discard all of the 
    // nesting logic and array sorting logic in the for loop, you've run out of reasons 
    // to discard the elements and can return true.
    return true;
}

// Helper function
let isPrimitive = (val) => {
    /*
    Determines if a value is a primitive or an object.
    */
    // null is for some reason an object
    if(val === null){
        return true;
    }
    
    // primitive types are the subset of types that are not objects or functions
    if(typeof val == "object" || typeof val == "function"){
      return false;
    } else{
      return true;
    }
}

// Don't add or change anything below this comment.
module.exports = deepEqual;