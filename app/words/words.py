import json

lines = [ line.strip() for line in open('tofel.out')]

words = {'words': lines}

print json.dumps(words)

