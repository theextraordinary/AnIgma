
const javaCode = `
  public class MyClass {
    // This is a comment

    public void myMethod() {
      // Method implementation
    }
  }
`;
const temp={}
temp.name="demo.java"
temp.code=javaCode
const tempArray=[temp]
preprocess(tempArray);
function preprocess(codeArray){
    for( const dict of codeArray){
        const Info=extractInformation(dict.code);
        console.log(Info);
    }
}
// Dependencies: npm install natural



// Extract key information
function extractInformation(code) {
    const functionRegex = /function\s+(\w+)\s*\(/g;
    const functionMatches = [...code.matchAll(functionRegex)];
    const functionNames = functionMatches.map(match => match[1]);
  
    // Example: Extract comments
    const commentRegex = /\/\/(.*)|\/\*([\s\S]*?)\*\//g;
    const commentMatches = [...code.matchAll(commentRegex)];
    const comments = commentMatches.map(match => match[1] || match[2]);
  
    // Example: Extract variable names
    const variableRegex = /let\s+([\w$]+)/g;
    const variableMatches = [...code.matchAll(variableRegex)];
    const variableNames = variableMatches.map(match => match[1]);
  
    // Example: Extract class names
    const classRegex = /class\s+(\w+)/g;
    const classMatches = [...code.matchAll(classRegex)];
    const classNames = classMatches.map(match => match[1]);
  
    // Return the extracted information as an object
    const extractedInfo = {
      functionNames,
      comments,
      variableNames,
      classNames
      // Add more extracted information as needed
    };
    return extractedInfo;
}

  
// Generate code summary using TF-IDF
function generateSummaryTFIDF(code) {
  const extractedInfo = extractInformation(code);

  // Preprocess the code
  // Remove comments, whitespace, or other irrelevant parts

  // Tokenize the code into sentences or phrases
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(code);

  // Generate TF-IDF matrix
  const tfidf = new natural.TfIdf();
  tfidf.addDocument(tokens);

  // Generate summary
  const summary = tfidf.listTerms(0 /* document index */).slice(0, 5 /* number of top terms */)
    .map(term => term.term)
    .join(' ');

  return summary;
}

// Generate code summary using TextRank
function generateSummaryTextRank(code) {
  // Implement TextRank algorithm for code summarization
  // Use libraries like Gensim or spaCy for TextRank implementation

  return summary;
}

// Example usage
//.md,.yml,.in,.py,.java,.js,.json,.cpp,.html,.css