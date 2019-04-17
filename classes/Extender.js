/**
 * A class which extends symbol instances by more useful functions.
 * 
 * Access renko.extender to use this class.
 */
class Extender {

    /**
     * Applies extension functions to the specified symbol instance.
     * Returns this object to support direct calls to an extended method in-line.
     * @param {object} obj 
     */
    extend(obj) {
        if(renko.isNullOrUndefined(obj) || renko.isNullOrUndefined(obj.stage)) {
            console.log("Extender.extend - obj must be a valid symbol instance!");
            return;
        }

        /**
         * Sets the scale X and Y using given values.
         * If only one argument provided, it will be set for both axis.
         */
        obj.setScale = function(x, y) {
            if(arguments.length === 1) {
                x = y = arguments[0];
            }
            obj.scaleX = x;
            obj.scaleY = y;
        }

        /**
         * Makes the current object block click events from going through.
         * Specify customAction to handle custom actions.
         */
        obj.setBlocking = function(customAction) {
            if(typeof customAction === "function") {
                customAction = customAction.bind(obj);
            }
            obj.addEventListener("mousedown", function() {
                if(typeof customAction === "function") {
                    customAction();
                }
            }.bind(obj));
        }

        /**
         * Automates the addition of event listeners using a single object that contains
         * the keys as event name and values as listener function.
         * Listener functions will automatically be bound to this object's context.
         */
        obj.addListeners = function(listeners) {
            if(!(listeners instanceof Object)) {
                return;
            }
            if(typeof listeners["click"] === "function") {
                obj.addEventListener("click", listeners["click"].bind(obj));
            }
            if(typeof listeners["mousedown"] === "function") {
                obj.addEventListener("mousedown", listeners["mousedown"].bind(obj));
            }
            if(typeof listeners["pressup"] === "function") {
                obj.addEventListener("pressup", listeners["pressup"].bind(obj));
            }
            if(typeof listeners["rollout"] === "function") {
                obj.addEventListener("rollout", listeners["rollout"].bind(obj));
            }
            if(typeof listeners["rollover"] === "function") {
                obj.addEventListener("rollover", listeners["rollover"].bind(obj));
            }
        }

        return obj;
    }
}
renko.extender = new Extender();