import java.io.File;


class ListDir {

	public static void main(String[] args) {
		File thisDir = new File("./").getParentFile();
		
		for(String s : thisDir.list()) {
			System.out.println(s);
		}

	}

}
