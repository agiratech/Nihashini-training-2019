
        function hello(){
            var n = 5;
            for (var row = 1;row <= n;row++){
                for (var space = row; space < n; space++){
                    document.write("&nbsp");
                }
                for (var col = 1;col <= row; col++){
                    document.write("*");
                }
                document.write("<br/>");
            }
        }
        hello();
