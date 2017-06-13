#!/usr/bin/python

import utils
from base import Database

try:
    import MySQLdb
except:
    pass

class DatabaseMySQL(Database):
    type_shorttext = "VARCHAR(255)" # This is a fudge due to indexing problems above 767 chars on multi-byte sets
    type_longtext = "LONGTEXT"
    type_clob = "LONGTEXT"
    type_datetime = "DATETIME"
    type_integer = "INTEGER"
    type_float = "DOUBLE"

    def connect(self):
        if self.password != "":
            return MySQLdb.connect(host=self.host, port=self.port, user=self.username, passwd=self.password, db=self.database, charset="utf8", use_unicode=True)
        else:
            return MySQLdb.connect(host=self.host, port=self.port, user=self.username, db=self.database, charset="utf8", use_unicode=True)

    def cursor_open(self):
        """ Overridden to apply timeout """
        c, s = Database.cursor_open(self)
        if self.timeout > 0: 
            s.execute("SET SESSION max_execution_time=%d" % self.timeout)
        return c, s

    def ddl_add_index(self, name, table, column, unique = False, partial = False):
        u = ""
        if unique: u = "UNIQUE "
        if partial: column = "%s(255)" % column
        return "CREATE %sINDEX %s ON %s (%s)" % (u, name, table, column)

    def ddl_drop_index(self, name, table):
        return "DROP INDEX %s ON %s" % (name, table)

    def ddl_modify_column(self, table, column, newtype, using = ""):
        return "ALTER TABLE %s MODIFY %s %s" % (table, column, newtype)

    def escape(self, s):
        """ Makes a string value safe for database queries
        """
        if s is None: return ""
        if utils.is_str(s):
            s = MySQLdb.escape_string(s)
        elif utils.is_unicode(s):
            # Encode the string as UTF-8 for MySQL escape_string 
            # then decode it back into unicode before continuing
            s = s.encode("utf-8")
            s = MySQLdb.escape_string(s)
            s = s.decode("utf-8")
        return s

    def sql_concat(self, items):
        """ Writes concat for a list of items """
        return "CONCAT(" + ",".join(items) + ")"

