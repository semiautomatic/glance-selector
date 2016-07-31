{
	var scope = "";
	var scopeIndex = 0;
}

Start = scopes:Scope* { return scopes }

ScopeChar = ">"
PropertyChar = ":"
PropertySeparator = ","
IndexChar = "#"
EscapeChar = "\\"

Scope
 = target:Target ScopeChar? {
 	scope += text()
 	return target;
 }

Target
 = label:Label position:Index? properties:Properties? Whitespace? { return { label: label.trim(), position: position, properties: properties || [], scope: scope.slice(0,-1), scopeIndex: scopeIndex++, path: (scope + text()).trim() } }

Label
 = chars:LabelCharacter+ { return chars.join('') }

LabelCharacter
   = !(EscapeChar / ScopeChar / IndexChar / PropertyChar) c:Character { return c }
   / c:EscapedSequence { return c }

Character
 = .

Whitespace
 = [ \t\r\n]+

EscapedSequence
 = EscapeChar c:(EscapeChar / IndexChar / ScopeChar / PropertyChar) { return c; }

Index
 = IndexChar position:Position { return position; }

Position
 = [0-9]+ { return parseInt(text(), 10); }

Properties
 = PropertyChar properties:Property* { return properties; }

Property
 = name:PropertyName PropertySeparator? { return name.trim() }

PropertyName
 = thing:PropertyCharacter+ { return thing.join("") }

PropertyCharacter
  = !(ScopeChar / PropertySeparator) c:Character { return c }
