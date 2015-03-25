#dd3dv.js

##注意！！
接下来的整个内容都是**“预定目标”**，是用来描述dd3dv.js**未来的样子**。由于这个目标实际上相当宏大，所以不可能等它完成时再放出来——我个人肯定坚持不到那个时候。**所以当前dd3dv.js能干什么请参考docs中的文档和example中的例子。**

##Introduce
**dd3dv.js**（Data Drive 3 Dimension View）是一个用于将大数据在网页端可视化的**3D引擎**，它的主要任务是将**已经完成**统计分析、数据挖掘、数据管理、压缩和过滤等步骤的数据在网页上**展示**（通过浏览器绘制渲染），它还提供给用户简单的**交互手段。**

引擎各个模块的功能和模块之间的关系如下图所示(这个图有点老，还未更新至最新模型)：

![img](https://raw.githubusercontent.com/ReiBuilder/DD3DV/master/docs/images/dd3dvModel.jpg)


1.	**3D Object**是在屏幕中出现的基本的3D对象，具有位置、朝向等基本属性。Plant、Box、Sphere、Sprite、Line和Symbol等用于表征数据，这些类以及Light和Camera都继承自3D Object。
	* **Plant**是一个平面，通过设置它的形状并使用Html5的Canvas元素设置其纹理，可以实现2D可视化的所有图形效果，而且Plant可以在3D空间中其他元素则是3D可视化独有的。
	* **Box**、**Sphere**和**Cylinder**都可以表示离散的对象。Sphere更普遍地用于表示图数据的节点，而Box和Cylinder可用于表示柱状图。
	* **Sprite**通常用来表示离散的对象或作为图结构的节点。和Box、Sphere及Cylinder不同的是，许多Sprite可以组成Sprite-System，也就是一个Sprite的集合，用户可以通过Sprite-System一次性生成或操作大量的数据对象。
	* **Line**的用处很多，它本身可以表示数据，作为2D或者3D空间坐标轴轴线，还可以表示图数据节点间的连线。
	* **Symbol**的用处也很多，可以作为2D或3D场景中的标注，也可以作为特定类型数据（比如云图或者舆情数据）的载体。Symbol作为数据载体和其他对象不同的地方在于，Symbol对象所使用的符号（词汇、短语、句子和其他符号）本身也具有意义。

	
2.	DataAdapter是引擎的数据接口，提供了三种通用的数据模型：离散型，序列型和图。三种数据类型可以嵌套，也可以在一定条件下互相转换。另外，数据接口还定义了能够在各种数据模型上实现的一些操作，这些操作可以由用户的交互操作触发。
	* **嵌套：**某种模型的数据集的元素本身可以是另一种模型的一个数据集。比如一个千万级别的用户数据集可以用离散型数据模型表示，而每一个用户的消费数据可以用序列型模型表示。
	* **转换：**引擎定义了不同模型数据之间转换的基本的默认方法，用户可以定义转换的具体方式，比如序列数据按照某个维度转换成离散数据。转换通常会造成原本数据集的破坏，但用户得以从不同的视角看待数据。
	* **操作：**包括了对模型数据的典型操作，比如对于离散型数据，实现了取中值，平均值、最大最小值等各种统计操作。对于图数据，实现了生成树，遍历，寻找最短路径，根据相关性或连接强度聚集等操作。这些操作通常和一些互动操作有默认的映射关系，也就是说某种互动操作会激活特定的操作。映射关系是可以编辑的。
	
3.	**DataCollection**将输入的数据模型和抽象的数据载体结合起来，根据数据类型的结构确定数据的视觉表征。所有抽象对象都可以独自地表示离散数据，而序列数据和图数据必须结合多种抽象对象。比如典型的图数据需要使用Sphere对象和Line对象作为图数据的节点和节点间的连接，Line对象表示必要的坐标轴，Symbol对象标明节点或连接的附加信息。


4.	**Space**是用于显示数据并接受用户操作的抽象3D空间，它还包括了Light和Camera对象，用于在3D空间中显示抽象对象。


5.	**Interaction**是引擎提供给用户的交互操作对象，它可以控制DataCollection对象所包含的数据集合以及表示这些数据的抽象3D对象，同时它也可以控制Space对象，间接地控制抽象3D空间的光照和摄像机。
	* **Pick：**选中对象，可以获得对象的详细信息。选中的对象可以是单个或多个，通常通过点击画面或在屏幕上画出一个虚拟的方形框实现。Pick操作所选中的看对象集合是Compare、Check和Compute操作的目标。
	* **Zoom：**变焦操作，可用通过控制Camera对象在抽象3D空间的位置实现，也可以通过数据集的选取或变换实现。当数据集极其庞大时非常有用。
	* **Move：**移动操作，和Zoom操作类似，可以让用户在3D空间中自由地查看数据。
	* **Compare：**对选取的数据在不同特征维度进行比较。
	* **Compute：**计算操作，用户可以选择引擎提供的默认计算模型，也可以自己实现需要的模型。

6.	**AnalysisPath**记录了用户分析过程中的操作和这些操作产生的一些中间结果，用于帮助用户确定分析路线，明确思路。AnalysisPath同样被可视化并且可以操作。它被视为Graph类型的数据，并通过Sprite、Line和Symbol对象现实。可以实现大部分针对数据的操作。
