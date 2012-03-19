<?php
class PDOTester extends PDO {
    public function __construct($dsn, $username = null, $password = null, $driver_options = array()) {
        parent::__construct($dsn, $username, $password, $driver_options);
        $this->setAttribute(PDO::ATTR_STATEMENT_CLASS, array(
                'PDOStatementTester',
                array($this)
        ));
    }

}

class PDOStatementTester extends PDOStatement {
    const NO_MAX_LENGTH = -1;

    protected $connection;
    protected $bound_params = array();

    protected function __construct(PDO $connection) {
        $this->connection = $connection;
    }

    public function bindParam($paramno, &$param, $type = PDO::PARAM_STR, $maxlen = null, $driverdata = null) {
        $this->bound_params[$paramno] = array(
                'value' => &$param,
                'type' => $type,
                'maxlen' => (is_null($maxlen)) ? self::NO_MAX_LENGTH : $maxlen,
            // ignore driver data
        );

        $result = parent::bindParam($paramno, $param, $type, $maxlen, $driverdata);
    }

    public function bindValue($parameter, $value, $data_type = PDO::PARAM_STR) {
        $this->bound_params[$parameter] = array(
                'value' => $value,
                'type' => $data_type,
                'maxlen' => self::NO_MAX_LENGTH
        );
        parent::bindValue($parameter, $value, $data_type);
    }

    public function getSQL($values = array()) {
        $sql = $this->queryString;

        if (sizeof($values) > 0) {
            foreach ($values as $key => $value) {
                $sql = str_replace($key, $this->connection->quote($value), $sql);
            }
        }

        if (sizeof($this->bound_params)) {
            foreach ($this->bound_params as $key => $param) {
                $value = $param['value'];
                if (!is_null($param['type'])) {
                    $value = self::cast($value, $param['type']);
                }
                if ($param['maxlen'] && $param['maxlen'] != self::NO_MAX_LENGTH) {
                    $value = self::truncate($value, $param['maxlen']);
                }
                if (!is_null($value)) {
                    $sql = str_replace($key, $this->connection->quote($value), $sql);
                } else {
                    $sql = str_replace($key, 'NULL', $sql);
                }
            }
        }
        return $sql;
    }

    static protected function cast($value, $type) {
        switch ($type) {
            case PDO::PARAM_BOOL:
                return (bool)$value;
                break;
            case PDO::PARAM_NULL:
                return null;
                break;
            case PDO::PARAM_INT:
                return (int)$value;
            case PDO::PARAM_STR:
            default:
                return $value;
        }
    }

    static protected function truncate($value, $length) {
        return substr($value, 0, $length);
    }

}

$pdo = new PDOTester('sqlite::memory:');
$pdo->query('CREATE TABLE foo (bar TEXT, baz TEXT, num NUMERIC, empty TEXT)');
$query = $pdo->prepare('SELECT * FROM foo WHERE bar = :bar AND baz = :baz');

// Test with passed in array
echo $query->getSQL(array(
        ':bar' => 'foo',
        ':baz' => 'bat'
)) . PHP_EOL;

$query = $pdo->prepare('SELECT * FROM foo WHERE bar = :bar AND baz = :baz AND num = :num AND empty=:empty');

// Test with bound params and values
$bar = 'bar';
$baz = 'baz';
$num = '0.1';
$empty = 'empty!!';

// Bind Param
$query->bindParam(':bar', $bar);

// Bind Value
$query->bindValue(':baz', $baz);

// Bind With types
$query->bindParam(':num', $num, PDO::PARAM_INT);
$query->bindParam(':empty', $empty, PDO::PARAM_NULL);

echo $query->getSQL() . PHP_EOL;

// Change the vars
$bar = 'foo';
$baz = 'bat';
$num = '2.6';
$empty = 'blah!';

echo $query->getSQL() . PHP_EOL;

// Bind with length
$query->bindParam(':bar', $bar, PDO::PARAM_STR, 2);

echo $query->getSQL() . PHP_EOL;
