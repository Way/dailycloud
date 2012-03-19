<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * AttrObject
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * The abstract class AttrObject secures and handles
 * the getter and setter for the DataAccessLayer.
 * It creates automatically a list of available
 * readers and writers for every application model
 * which inherits from the DataAccessLayer.
 * @see       -   DataAccessLayer.php
 *
 * @file      -   AttrObject.php
 * @location  -   ./server/database/helper/AttrObject.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * abstract class: AttrObject
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Base class for object extension.
 */
abstract class AttrObject {
    /**
     * List of attributes available for reading.
     * @var array
     */
    protected $_attrReaders = array();

    /**
     * List of attributes available for writing.
     * @var array
     */
    protected $_attrWriters = array();

    /**
     * Dynamically get value for an attribute. Subclasses should use a method
     * named _get to overload, which is called from here.
     *
     * @since 0.1
     * @access public
     *
     * @param (String) $name - Name of attribute
     * @return String
     */
    public function __get($name) {
        // attribute-reader value
        if(in_array($name, $this->_attrReaders)) {
            return $this->_get($name);
        }
        // call overloading for subclass
        if(method_exists($this, '_get')) {
            return $this->_get($name);
        }
        show_error("Unrecognized attribute '$name'");
    }

    /**
     * Dynamically set value for an attribute. Attributes cannot be set once an
     * object has been destroyed. Subclasses should use a method
     * named _set to overload, which is called from here.
     *
     * @since 0.1
     * @access public
     *
     * @param (String) $name - Name of attribute
     * @param (mixed) $value - Value of attribute
     * @return void
     */
    public function __set($name, $value) {
        // attribute-writer value
        if(in_array($name, $this->_attrWriters)) {
            return $this->_set($name, $value);
        }
        // call overloading for subclass
        if(method_exists($this, '_set')) {
            return $this->_set($name, $value);
        }
        show_error('Unrecognized attribute "$name"');
    }

    /**
     * Check if items are set.
     *
     * @since 0.1
     * @access public
     *
     * @param (String) $name - Name of attribute
     * @return Boolean
     */
    public function __isset($name) {
        // attribute-reader value
        if(in_array($name, $this->_attrReaders)) {
            $value = $this->_get($name);
            return !empty($value);
        }
        // call overloading for subclass
        if(method_exists($this, '_isset')) {
            return $this->_isset($name);
        }
    }

    /**
     * Add list of attribute readers for this object.
     *
     * Multiple readers can be set at once.
     *
     * @since 0.1
     * @access public
     *
     * @use:
     * <code>
     *   class User extends AttrObject
     *   {
     *     protected $_foo = null;
     *     protected $_bar = null;
     *     protected $_baz = null;
     *
     *     public function _initialize()
     *     {
     *       $this->attrReader('foo', 'bar', 'baz');
     *     }
     *
     *     // this overrides retrieving default value from the property
     *     // and allows us to split the value when it is retrieved
     *     public function getFoo($name)
     *     {
     *       return explode(', ', 'foo');
     *     }
     *   }
     * </code>
     *
     * When readers are accessed, they will attempt to first
     * read a public method prefixed with `get`. If this method
     * is missing, we'll fall back to a generic hash.
     *
     * </code>
     *   $user = new User;
     *
     *   // our attribute reader called "getFoo" will be executed
     *   print $user->foo;  // => 'foo'
     *
     *   // when no proxy method is defined, we just return $_bar's value
     *   print $user->bar;  // => null
     * <code>
     *
     * @param (varargs) $attributes - dynamic attributes
     * @return void
     */
    public function attrReader($attributes) {
        $names = func_get_args();
        $this->_attrReaders = array_unique(array_merge($this->_attrReaders, $names));
    }

    /**
     * Add list of attribute writers for this object.
     *
     * Multiple writers can be set at once.
     *
     * @since 0.1
     * @access public
     *
     * <code>
     *   class User extends Mad_Model_Base
     *   {
     *     protected $_foo = null;
     *     protected $_bar = null;
     *     protected $_baz = null;
     *
     *     public function _initialize()
     *     {
     *       $this->attrWriter('foo', 'bar', 'baz');
     *       $this->attrReader('foo');
     *     }
     *
     *     // this overrides setting default value from $_foo and
     *     // allows us to join the array value before it is assigned
     *     public function setFoo($value)
     *     {
     *       $this->_foo = join(', ', $value);
     *     }
     *   }
     * </code>
     *
     * When writers are accessed, they will attempt to first
     * use a public method prefixed with `set`. If this method
     * is missing, we'll fall back to a generic hash.
     *
     * <code>
     *   // we pass in the "foo" attribute as an array
     *   $user = new User;
     *   $user->foo = array('derek', 'mike');
     *
     *   // our attribute writer called "setFoo" to join it to a string
     *   print $user->foo;  // => "derek, mike"
     *
     *   // when no proxy method is defined, we just set $_bar's value
     *   $user->bar = 'test';
     * </code>
     *
     * @param (varargs) $attributes - dynamic attributes
     * @return void
     */
    public function attrWriter($attributes) {
        $names = func_get_args();
        $this->_attrWriters = array_unique(array_merge($this->_attrWriters, $names));
    }

    /**
     * Add list of attribute reader/writers for this object.
     *
     * Multiple accessors can be set at once.
     *
     * @since 0.1
     * @access public
     *
     * <code>
     *   class User extends Mad_Model_Base
     *   {
     *     protected $_foo => null;
     *     protected $_bar => null;
     *
     *     public function _initialize()
     *     {
     *       $this->attrAccessor('foo', 'bar');
     *     }
     *
     *     // enclose entire string in quotes
     *     public function getFoo()
     *     {
     *       return '"'.$this->_foo.'"';
     *     }
     *
     *     // strip out commas from value
     *     public function setFoo($value)
     *     {
     *       $this->_foo = str_replace(',', '', $value);
     *     }
     *   }
     * </code>
     *
     * When accessors are accessed, they will attempt to first
     * read a public method prefixed with `get` or `set`. If these method
     * are missing, we'll fall back to the protected property value.
     *
     * <code>
     *   // This allows us to set/get the "foo" property
     *   $user = new User;
     *   $user->foo = 'hey, there'
     *
     *   print $user->foo;  // => '"hey there"'
     *
     *   // when no proxy method is defined, we just return $_bar's value
     *   $user->bar = 'test';
     *   print $user->bar; // => 'test'
     * </code>
     *
     * @param (varargs) $attributes - dynamic attributes
     * @return void
     */
    public function attrAccessor($attributes) {
        $names = func_get_args();
        $this->_attrReaders = array_unique(array_merge($this->_attrReaders, $names));
        $this->_attrWriters = array_unique(array_merge($this->_attrWriters, $names));
    }

    /**
     * Get the value for an attribute in this object.
     *
     * @since 0.1
     * @access private
     *
     * @param (String) $name - Name of attribute
     * @return String
     */
    private function _get($name) {
        // check for reader proxy method
        $methodName = 'get' . ucfirst($name);
        if(method_exists($this, $methodName)) {
            return $this->$methodName();
        } else {
            $property = $name;
            return $this->$property;
        }
    }

    /**
     * Set the value for an attribute in this object.
     *
     * @since 0.1
     * @access private
     *
     * @param (String) $name - Name of attribute
     * @param (mixed) $value - Value of attribute
     */
    private function _set($name, $value) {
        $methodName = 'set' . ucfirst($name);
        if(method_exists($this, $methodName)) {
            $this->$methodName($value);
        } else {
            $property = $name;
            $this->$property = $value;
        }
    }

}
